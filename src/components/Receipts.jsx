import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Receipt, Download, Eye, Calendar, DollarSign, User, Filter } from 'lucide-react'
import { loanService } from '../firebase/loanService'
import { mockLoanService } from '../firebase/mockService'

export default function Receipts({ user }) {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [filterMethod, setFilterMethod] = useState('All')
  const [filterDateRange, setFilterDateRange] = useState('All')

  // Load receipts on component mount
  useEffect(() => {
    loadReceipts()
  }, [])

  const loadReceipts = async () => {
    try {
      setLoading(true)
      let firebaseLoans = []
      
      try {
        // Try Firebase first
        firebaseLoans = await loanService.getAllLoans()
      } catch (firebaseError) {
        console.warn('Firebase failed, using mock service:', firebaseError)
        // Fallback to mock service
        firebaseLoans = await mockLoanService.getAllLoans()
      }
      
      // Extract all payments from all loans to create receipts
      const allReceipts = []
      firebaseLoans.forEach(loan => {
        if (loan.payments && loan.payments.length > 0) {
          loan.payments.forEach(payment => {
            allReceipts.push({
              ...payment,
              customerName: loan.customerName,
              customerPhone: loan.customerPhone,
              loanId: loan.loanId || loan.id,
              purpose: loan.purpose
            })
          })
        }
      })
      
      // Sort receipts by payment date (newest first)
      allReceipts.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      setReceipts(allReceipts)
    } catch (error) {
      console.error('Error loading receipts:', error)
      // Fallback to mock receipts data
      const mockReceipts = [
        {
          paymentId: 'PAY_001',
          loanId: 'SF3L2zyPcPqfrYKZpm9n',
          emiNumber: 1,
          amountPaid: 4441,
          paymentDate: '2024-07-15',
          paymentMethod: 'Cash',
          collectedBy: 'admin@mfi.com',
          customerName: 'Rajesh Kumar',
          customerPhone: '9876543210',
          purpose: 'Business Expansion'
        },
        {
          paymentId: 'PAY_002',
          loanId: 'YzlRoOSBOx3BN6WLHYoQ',
          emiNumber: 1,
          amountPaid: 3465,
          paymentDate: '2024-07-10',
          paymentMethod: 'Bank Transfer',
          collectedBy: 'manager@mfi.com',
          customerName: 'Priya Sharma',
          customerPhone: '9876543211',
          purpose: 'Home Renovation'
        }
      ]
      setReceipts(mockReceipts)
    } finally {
      setLoading(false)
    }
  }

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      receipt.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.customerPhone?.includes(searchTerm)

    const matchesMethod = filterMethod === 'All' || receipt.paymentMethod === filterMethod

    let matchesDate = true
    if (filterDateRange !== 'All') {
      const paymentDate = new Date(receipt.paymentDate)
      const today = new Date()
      
      switch (filterDateRange) {
        case 'Today':
          matchesDate = paymentDate.toDateString() === today.toDateString()
          break
        case 'This Week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = paymentDate >= weekAgo
          break
        case 'This Month':
          matchesDate = paymentDate.getMonth() === today.getMonth() && 
                       paymentDate.getFullYear() === today.getFullYear()
          break
        case 'Last 3 Months':
          const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
          matchesDate = paymentDate >= threeMonthsAgo
          break
      }
    }

    return matchesSearch && matchesMethod && matchesDate
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPaymentMethodBadge = (method) => {
    const colors = {
      'Cash': 'bg-green-100 text-green-800',
      'Bank Transfer': 'bg-blue-100 text-blue-800',
      'Digital Payment': 'bg-purple-100 text-purple-800',
      'Cheque': 'bg-orange-100 text-orange-800'
    }
    return <Badge className={colors[method] || 'bg-gray-100 text-gray-800'}>{method}</Badge>
  }

  const viewReceipt = (receipt) => {
    setSelectedReceipt(receipt)
    setIsReceiptDialogOpen(true)
  }

  const downloadReceipt = (receipt) => {
    const receiptContent = `
EMI PAYMENT RECEIPT
==================

Receipt Number: ${receipt.paymentId}
Date: ${new Date(receipt.paymentDate).toLocaleDateString()}

Customer Details:
Name: ${receipt.customerName}
Phone: ${receipt.customerPhone}

Loan Details:
Loan ID: ${receipt.loanId}
Purpose: ${receipt.purpose}
EMI Number: ${receipt.emiNumber}
Amount Paid: ${formatCurrency(receipt.amountPaid)}
Payment Method: ${receipt.paymentMethod}

Collected By: ${receipt.collectedBy}

Thank you for your payment!

---
Generated on: ${new Date().toLocaleString()}
MFI Dashboard System
    `
    
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt_${receipt.paymentId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllReceipts = () => {
    if (filteredReceipts.length === 0) {
      alert('No receipts to download')
      return
    }

    const csvContent = [
      'Receipt ID,Date,Customer Name,Phone,Loan ID,EMI Number,Amount Paid,Payment Method,Collected By',
      ...filteredReceipts.map(receipt => 
        `${receipt.paymentId},${receipt.paymentDate},${receipt.customerName},${receipt.customerPhone},${receipt.loanId},${receipt.emiNumber},${receipt.amountPaid},${receipt.paymentMethod},${receipt.collectedBy}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipts_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTotalAmount = () => {
    return filteredReceipts.reduce((total, receipt) => total + receipt.amountPaid, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-600">View and manage payment receipts</p>
        </div>
        <Button onClick={downloadAllReceipts} disabled={filteredReceipts.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Total Receipts</div>
                <div className="font-medium">{filteredReceipts.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-medium">{formatCurrency(getTotalAmount())}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-500">Latest Payment</div>
                <div className="font-medium">
                  {filteredReceipts.length > 0 
                    ? new Date(filteredReceipts[0].paymentDate).toLocaleDateString()
                    : 'No payments'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search & Filter Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by receipt ID, loan ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Digital Payment">Digital Payment</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Time</SelectItem>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts ({filteredReceipts.length})</CardTitle>
          <CardDescription>
            All EMI payment receipts with details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Loan Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Collected By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.paymentId}>
                    <TableCell>
                      <div className="font-medium">{receipt.paymentId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(receipt.paymentDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{receipt.customerName}</div>
                        <div className="text-sm text-gray-500">{receipt.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{receipt.loanId}</div>
                        <div className="text-sm text-gray-500">EMI #{receipt.emiNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(receipt.amountPaid)}</div>
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(receipt.paymentMethod)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{receipt.collectedBy}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewReceipt(receipt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReceipt(receipt)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Detail Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Detailed receipt information
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">EMI PAYMENT RECEIPT</h3>
                  <p className="text-sm text-gray-600">Receipt #{selectedReceipt.paymentId}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(selectedReceipt.paymentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span>{selectedReceipt.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{selectedReceipt.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan ID:</span>
                    <span>{selectedReceipt.loanId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose:</span>
                    <span>{selectedReceipt.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">EMI Number:</span>
                    <span>#{selectedReceipt.emiNumber}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span>{formatCurrency(selectedReceipt.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span>{selectedReceipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collected By:</span>
                    <span>{selectedReceipt.collectedBy}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
                  Thank you for your payment!
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => downloadReceipt(selectedReceipt)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

