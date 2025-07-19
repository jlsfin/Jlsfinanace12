import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Receipt, Calendar, DollarSign, User, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { loanService } from '../firebase/loanService'
import { mockLoanService } from '../firebase/mockService'
import { generateEMISchedule } from '../utils/downloadUtils'

export default function EMICollection({ user }) {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [collectionData, setCollectionData] = useState({
    emiNumber: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    collectedBy: user?.email || 'admin@mfi.com'
  })
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Load active loans on component mount
  useEffect(() => {
    loadActiveLoans()
  }, [])

  const loadActiveLoans = async () => {
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
      
      // Filter only active loans
      const activeLoans = firebaseLoans.filter(loan => loan.status === 'active')
      setLoans(activeLoans)
    } catch (error) {
      console.error('Error loading loans:', error)
      // Fallback to mock data
      const mockActiveLoans = [
        {
          id: 'L001',
          loanId: 'SF3L2zyPcPqfrYKZpm9n',
          customerId: 1,
          customerName: 'Rajesh Kumar',
          customerPhone: '9876543210',
          amount: 50000,
          interestRate: 12,
          tenure: 12,
          monthlyEMI: 4441,
          status: 'active',
          disbursedDate: '2024-01-15',
          nextDueDate: '2024-08-15',
          totalPaid: 31087,
          remainingAmount: 18913,
          completedEMIs: 7,
          purpose: 'Business Expansion',
          payments: []
        },
        {
          id: 'L002',
          loanId: 'YzlRoOSBOx3BN6WLHYoQ',
          customerId: 2,
          customerName: 'Priya Sharma',
          customerPhone: '9876543211',
          amount: 75000,
          interestRate: 10,
          tenure: 24,
          monthlyEMI: 3465,
          status: 'active',
          disbursedDate: '2024-02-20',
          nextDueDate: '2024-08-20',
          totalPaid: 20790,
          remainingAmount: 54210,
          completedEMIs: 6,
          purpose: 'Home Renovation',
          payments: []
        }
      ]
      setLoans(mockActiveLoans)
    } finally {
      setLoading(false)
    }
  }

  const filteredLoans = loans.filter(loan =>
    loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customerPhone?.includes(searchTerm)
  )

  const handleCollectEMI = async () => {
    if (!collectionData.emiNumber || !collectionData.amountPaid) {
      alert('Please fill all required fields')
      return
    }

    try {
      setSubmitting(true)
      
      const payment = {
        paymentId: `PAY_${Date.now()}`,
        loanId: selectedLoan.loanId || selectedLoan.id,
        emiNumber: parseInt(collectionData.emiNumber),
        amountPaid: parseFloat(collectionData.amountPaid),
        paymentDate: collectionData.paymentDate,
        paymentMethod: collectionData.paymentMethod,
        collectedBy: collectionData.collectedBy,
        receiptUrl: `receipt_${Date.now()}.pdf`
      }

      // Update loan with new payment
      const updatedLoan = {
        ...selectedLoan,
        payments: [...(selectedLoan.payments || []), payment],
        completedEMIs: (selectedLoan.completedEMIs || 0) + 1,
        totalPaid: (selectedLoan.totalPaid || 0) + parseFloat(collectionData.amountPaid),
        remainingAmount: (selectedLoan.remainingAmount || selectedLoan.amount) - parseFloat(collectionData.amountPaid)
      }

      // Update next due date
      const nextEMIDate = new Date(collectionData.paymentDate)
      nextEMIDate.setMonth(nextEMIDate.getMonth() + 1)
      updatedLoan.nextDueDate = nextEMIDate.toISOString().split('T')[0]

      // Update loans list
      setLoans(loans.map(loan => 
        (loan.loanId || loan.id) === (selectedLoan.loanId || selectedLoan.id) ? updatedLoan : loan
      ))

      // Reset form
      setCollectionData({
        emiNumber: '',
        amountPaid: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        collectedBy: user?.email || 'admin@mfi.com'
      })
      
      setIsCollectionDialogOpen(false)
      alert('EMI collected successfully!')
    } catch (error) {
      console.error('Error collecting EMI:', error)
      alert('Failed to collect EMI. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getNextEMINumber = (loan) => {
    return (loan.completedEMIs || 0) + 1
  }

  const getStatusBadge = (loan) => {
    const nextEMI = getNextEMINumber(loan)
    const today = new Date()
    const dueDate = new Date(loan.nextDueDate)
    
    if (nextEMI > loan.tenure) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    } else if (dueDate < today) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const generateReceipt = (payment, loan) => {
    return {
      receiptNumber: payment.paymentId,
      date: payment.paymentDate,
      customerName: loan.customerName,
      customerPhone: loan.customerPhone,
      loanId: loan.loanId || loan.id,
      emiNumber: payment.emiNumber,
      amountPaid: payment.amountPaid,
      paymentMethod: payment.paymentMethod,
      collectedBy: payment.collectedBy,
      remainingBalance: loan.remainingAmount
    }
  }

  const viewReceipt = (payment, loan) => {
    const receipt = generateReceipt(payment, loan)
    setSelectedReceipt(receipt)
    setIsReceiptDialogOpen(true)
  }

  const downloadReceipt = (receipt) => {
    const receiptContent = `
EMI PAYMENT RECEIPT
==================

Receipt Number: ${receipt.receiptNumber}
Date: ${new Date(receipt.date).toLocaleDateString()}

Customer Details:
Name: ${receipt.customerName}
Phone: ${receipt.customerPhone}

Loan Details:
Loan ID: ${receipt.loanId}
EMI Number: ${receipt.emiNumber}
Amount Paid: ${formatCurrency(receipt.amountPaid)}
Payment Method: ${receipt.paymentMethod}
Remaining Balance: ${formatCurrency(receipt.remainingBalance)}

Collected By: ${receipt.collectedBy}

Thank you for your payment!
    `
    
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt_${receipt.receiptNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">EMI Collection</h1>
          <p className="text-gray-600">Collect EMI payments and generate receipts</p>
        </div>
      </div>

      {/* Search Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Active Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by loan ID, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Loans ({filteredLoans.length})</CardTitle>
          <CardDescription>
            Loans eligible for EMI collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Next EMI</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.loanId || loan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{loan.loanId || loan.id}</div>
                        <div className="text-sm text-gray-500">{loan.purpose}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{loan.customerName}</div>
                        <div className="text-sm text-gray-500">{loan.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">EMI #{getNextEMINumber(loan)}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(loan.monthlyEMI)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {loan.nextDueDate ? new Date(loan.nextDueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(loan)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog open={isCollectionDialogOpen && selectedLoan?.id === loan.id} onOpenChange={(open) => {
                          setIsCollectionDialogOpen(open)
                          if (!open) setSelectedLoan(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLoan(loan)
                                setCollectionData({
                                  ...collectionData,
                                  emiNumber: getNextEMINumber(loan).toString(),
                                  amountPaid: loan.monthlyEMI.toString()
                                })
                              }}
                              disabled={getNextEMINumber(loan) > loan.tenure}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Collect
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Collect EMI Payment</DialogTitle>
                              <DialogDescription>
                                Record EMI payment for {selectedLoan?.customerName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="emiNumber">EMI Number</Label>
                                  <Input
                                    id="emiNumber"
                                    type="number"
                                    value={collectionData.emiNumber}
                                    onChange={(e) => setCollectionData({...collectionData, emiNumber: e.target.value})}
                                    placeholder="EMI number"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="amountPaid">Amount Paid (₹)</Label>
                                  <Input
                                    id="amountPaid"
                                    type="number"
                                    value={collectionData.amountPaid}
                                    onChange={(e) => setCollectionData({...collectionData, amountPaid: e.target.value})}
                                    placeholder="Amount paid"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="paymentDate">Payment Date</Label>
                                  <Input
                                    id="paymentDate"
                                    type="date"
                                    value={collectionData.paymentDate}
                                    onChange={(e) => setCollectionData({...collectionData, paymentDate: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="paymentMethod">Payment Method</Label>
                                  <Select value={collectionData.paymentMethod} onValueChange={(value) => setCollectionData({...collectionData, paymentMethod: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Cash">Cash</SelectItem>
                                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                      <SelectItem value="Digital Payment">Digital Payment</SelectItem>
                                      <SelectItem value="Cheque">Cheque</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="collectedBy">Collected By</Label>
                                <Input
                                  id="collectedBy"
                                  value={collectionData.collectedBy}
                                  onChange={(e) => setCollectionData({...collectionData, collectedBy: e.target.value})}
                                  placeholder="Collector name/email"
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCollectionDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleCollectEMI} disabled={submitting}>
                                  {submitting ? 'Processing...' : 'Collect EMI'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {loan.payments && loan.payments.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewReceipt(loan.payments[loan.payments.length - 1], loan)}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              EMI payment receipt details
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">EMI PAYMENT RECEIPT</h3>
                  <p className="text-sm text-gray-600">Receipt #{selectedReceipt.receiptNumber}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(selectedReceipt.date).toLocaleDateString()}</span>
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
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => downloadReceipt(selectedReceipt)}>
                  <Receipt className="h-4 w-4 mr-2" />
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

