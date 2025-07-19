import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Search, DollarSign, CheckCircle, Clock, FileText, User, Calendar, CreditCard, AlertCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export default function LoanDisbursal({ user }) {
  const navigate = useNavigate()
  const { applicationId } = useParams()
  const [approvedLoans, setApprovedLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [isDisbursalDialogOpen, setIsDisbursalDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [disbursalData, setDisbursalData] = useState({
    disbursalAmount: '',
    disbursalDate: new Date().toISOString().split('T')[0],
    disbursalMethod: 'Bank Transfer',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    chequeNumber: '',
    processingFeeDeducted: '',
    netDisbursalAmount: '',
    remarks: ''
  })

  // Load approved loans on component mount
  useEffect(() => {
    loadApprovedLoans()
  }, [])

  // Auto-open disbursal dialog for specific application if applicationId is provided in URL
  useEffect(() => {
    if (applicationId && approvedLoans.length > 0) {
      const loan = approvedLoans.find(loan => loan.applicationId === applicationId)
      if (loan) {
        openDisbursalDialog(loan)
      }
    }
  }, [applicationId, approvedLoans])

  const loadApprovedLoans = async () => {
    try {
      setLoading(true)
      // Mock approved loans data - in real app, this would come from API
      const mockApprovedLoans = [
        {
          applicationId: 'APP_001',
          loanId: 'LN_001',
          customerId: 1,
          customerName: 'Rajesh Kumar',
          customerPhone: '9876543210',
          customerEmail: 'rajesh@example.com',
          approvedAmount: 100000,
          approvedTenure: 24,
          interestRate: 12,
          processingFee: 1000,
          loanPurpose: 'Business Expansion',
          applicationDate: '2024-07-01',
          approvalDate: '2024-07-15',
          approvedBy: 'manager@mfi.com',
          disbursalStatus: 'Pending',
          monthlyEMI: 4707,
          bankAccountNumber: '1234567890',
          bankName: 'State Bank of India',
          ifscCode: 'SBIN0001234',
          approvalConditions: 'Submit business registration certificate'
        },
        {
          applicationId: 'APP_003',
          loanId: 'LN_002',
          customerId: 3,
          customerName: 'Amit Singh',
          customerPhone: '9876543212',
          customerEmail: 'amit@example.com',
          approvedAmount: 75000,
          approvedTenure: 18,
          interestRate: 11.5,
          processingFee: 750,
          loanPurpose: 'Education',
          applicationDate: '2024-06-28',
          approvalDate: '2024-07-12',
          approvedBy: 'admin@mfi.com',
          disbursalStatus: 'Pending',
          monthlyEMI: 4654,
          bankAccountNumber: '9876543210',
          bankName: 'HDFC Bank',
          ifscCode: 'HDFC0001234',
          approvalConditions: 'None'
        },
        {
          applicationId: 'APP_005',
          loanId: 'LN_003',
          customerId: 5,
          customerName: 'Meera Patel',
          customerPhone: '9876543216',
          customerEmail: 'meera@example.com',
          approvedAmount: 50000,
          approvedTenure: 12,
          interestRate: 13,
          processingFee: 500,
          loanPurpose: 'Home Renovation',
          applicationDate: '2024-07-10',
          approvalDate: '2024-07-18',
          approvedBy: 'manager@mfi.com',
          disbursalStatus: 'Disbursed',
          disbursalDate: '2024-07-20',
          disbursalAmount: 50000,
          netDisbursalAmount: 49500,
          disbursalMethod: 'Bank Transfer',
          disbursedBy: 'admin@mfi.com',
          monthlyEMI: 4442
        }
      ]
      setApprovedLoans(mockApprovedLoans)
    } catch (error) {
      console.error('Error loading approved loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLoans = approvedLoans.filter(loan =>
    loan.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customerPhone?.includes(searchTerm) ||
    loan.loanPurpose?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Disbursed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Processing': 'bg-blue-100 text-blue-800'
    }
    const icons = {
      'Pending': Clock,
      'Disbursed': CheckCircle,
      'Failed': AlertCircle,
      'Processing': FileText
    }
    const Icon = icons[status] || Clock
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const openDisbursalDialog = (loan) => {
    setSelectedLoan(loan)
    const netAmount = loan.approvedAmount - (loan.processingFee || 0)
    setDisbursalData({
      disbursalAmount: loan.approvedAmount.toString(),
      disbursalDate: new Date().toISOString().split('T')[0],
      disbursalMethod: 'Bank Transfer',
      bankAccountNumber: loan.bankAccountNumber || '',
      bankName: loan.bankName || '',
      ifscCode: loan.ifscCode || '',
      chequeNumber: '',
      processingFeeDeducted: (loan.processingFee || 0).toString(),
      netDisbursalAmount: netAmount.toString(),
      remarks: ''
    })
    setIsDisbursalDialogOpen(true)
  }

  const handleDisbursalSubmit = async () => {
    if (!disbursalData.disbursalAmount || !disbursalData.disbursalDate || !disbursalData.disbursalMethod) {
      alert('Please fill all required fields')
      return
    }

    if (disbursalData.disbursalMethod === 'Bank Transfer' && 
        (!disbursalData.bankAccountNumber || !disbursalData.bankName || !disbursalData.ifscCode)) {
      alert('Please fill all bank details for bank transfer')
      return
    }

    if (disbursalData.disbursalMethod === 'Cheque' && !disbursalData.chequeNumber) {
      alert('Please enter cheque number')
      return
    }

    try {
      setSubmitting(true)
      
      const updatedLoan = {
        ...selectedLoan,
        disbursalStatus: 'Disbursed',
        disbursalDate: disbursalData.disbursalDate,
        disbursalAmount: parseFloat(disbursalData.disbursalAmount),
        netDisbursalAmount: parseFloat(disbursalData.netDisbursalAmount),
        disbursalMethod: disbursalData.disbursalMethod,
        processingFeeDeducted: parseFloat(disbursalData.processingFeeDeducted),
        disbursalRemarks: disbursalData.remarks,
        disbursedBy: user?.email || 'admin@mfi.com',
        chequeNumber: disbursalData.chequeNumber || null
      }

      // Update loans list
      setApprovedLoans(approvedLoans.map(loan => 
        loan.applicationId === selectedLoan.applicationId ? updatedLoan : loan
      ))

      setIsDisbursalDialogOpen(false)
      
      // Show success message and redirect to dashboard
      alert('Loan disbursed successfully! Workflow completed. Redirecting to dashboard...')
      
      // Redirect to dashboard as the workflow is complete
      navigate('/dashboard')
      
      setSelectedLoan(null)
    } catch (error) {
      console.error('Error processing disbursal:', error)
      alert('Failed to process disbursal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateNetAmount = () => {
    const disbursalAmount = parseFloat(disbursalData.disbursalAmount) || 0
    const processingFee = parseFloat(disbursalData.processingFeeDeducted) || 0
    return disbursalAmount - processingFee
  }

  // Update net amount when disbursal amount or processing fee changes
  useEffect(() => {
    const netAmount = calculateNetAmount()
    setDisbursalData(prev => ({
      ...prev,
      netDisbursalAmount: netAmount.toString()
    }))
  }, [disbursalData.disbursalAmount, disbursalData.processingFeeDeducted])

  const generateDisbursalReceipt = (loan) => {
    const receiptContent = `
LOAN DISBURSAL RECEIPT
=====================

Loan ID: ${loan.loanId}
Application ID: ${loan.applicationId}
Date: ${new Date(loan.disbursalDate).toLocaleDateString()}

Customer Details:
Name: ${loan.customerName}
Phone: ${loan.customerPhone}
Email: ${loan.customerEmail}

Loan Details:
Approved Amount: ${formatCurrency(loan.approvedAmount)}
Processing Fee: ${formatCurrency(loan.processingFeeDeducted || 0)}
Net Disbursed Amount: ${formatCurrency(loan.netDisbursalAmount)}
Tenure: ${loan.approvedTenure} months
Interest Rate: ${loan.interestRate}% per annum
Monthly EMI: ${formatCurrency(loan.monthlyEMI)}

Disbursal Details:
Method: ${loan.disbursalMethod}
${loan.disbursalMethod === 'Bank Transfer' ? `Bank: ${loan.bankName}\nAccount: ${loan.bankAccountNumber}\nIFSC: ${loan.ifscCode}` : ''}
${loan.chequeNumber ? `Cheque Number: ${loan.chequeNumber}` : ''}

Disbursed By: ${loan.disbursedBy}

---
Generated on: ${new Date().toLocaleString()}
MFI Dashboard System
    `
    
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `disbursal_receipt_${loan.loanId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loan Disbursal</h1>
          <p className="text-gray-600">Manage loan disbursals for approved applications</p>
        </div>
      </div>

      {/* Disbursal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-500">Pending Disbursal</div>
                <div className="font-medium">
                  {approvedLoans.filter(loan => loan.disbursalStatus === 'Pending').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">Disbursed Today</div>
                <div className="font-medium">
                  {approvedLoans.filter(loan => 
                    loan.disbursalStatus === 'Disbursed' && 
                    loan.disbursalDate === new Date().toISOString().split('T')[0]
                  ).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Total Pending Amount</div>
                <div className="font-medium">
                  {formatCurrency(
                    approvedLoans
                      .filter(loan => loan.disbursalStatus === 'Pending')
                      .reduce((sum, loan) => sum + loan.approvedAmount, 0)
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-500">Disbursed Amount</div>
                <div className="font-medium">
                  {formatCurrency(
                    approvedLoans
                      .filter(loan => loan.disbursalStatus === 'Disbursed')
                      .reduce((sum, loan) => sum + (loan.netDisbursalAmount || 0), 0)
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Approved Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by loan ID, application ID, customer name, phone, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Approved Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Loans for Disbursal ({filteredLoans.length})</CardTitle>
          <CardDescription>
            Loans approved and ready for disbursal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead>Disbursal Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.applicationId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{loan.loanId}</div>
                        <div className="text-sm text-gray-500">{loan.applicationId}</div>
                        <div className="text-sm text-gray-500">{loan.loanPurpose}</div>
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
                        <div className="font-medium">{formatCurrency(loan.approvedAmount)}</div>
                        <div className="text-sm text-gray-500">
                          {loan.approvedTenure} months @ {loan.interestRate}%
                        </div>
                        <div className="text-sm text-gray-500">
                          EMI: {formatCurrency(loan.monthlyEMI)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(loan.approvalDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        By: {loan.approvedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(loan.disbursalStatus)}
                      {loan.disbursalDate && (
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(loan.disbursalDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {loan.disbursalStatus === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDisbursalDialog(loan)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Disburse
                          </Button>
                        )}
                        {loan.disbursalStatus === 'Disbursed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateDisbursalReceipt(loan)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Receipt
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

      {/* Disbursal Dialog */}
      <Dialog open={isDisbursalDialogOpen} onOpenChange={setIsDisbursalDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Disbursal - {selectedLoan?.loanId}</DialogTitle>
            <DialogDescription>
              Process loan disbursal for approved application
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-6">
              {/* Loan Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Loan Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <div className="font-medium">{selectedLoan.customerName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Approved Amount:</span>
                    <div className="font-medium">{formatCurrency(selectedLoan.approvedAmount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tenure:</span>
                    <div className="font-medium">{selectedLoan.approvedTenure} months</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Interest Rate:</span>
                    <div className="font-medium">{selectedLoan.interestRate}% p.a.</div>
                  </div>
                </div>
              </div>

              {/* Disbursal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Disbursal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="disbursalAmount">Disbursal Amount (₹) *</Label>
                    <Input
                      id="disbursalAmount"
                      type="number"
                      value={disbursalData.disbursalAmount}
                      onChange={(e) => setDisbursalData({...disbursalData, disbursalAmount: e.target.value})}
                      placeholder="Enter disbursal amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disbursalDate">Disbursal Date *</Label>
                    <Input
                      id="disbursalDate"
                      type="date"
                      value={disbursalData.disbursalDate}
                      onChange={(e) => setDisbursalData({...disbursalData, disbursalDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disbursalMethod">Disbursal Method *</Label>
                    <Select value={disbursalData.disbursalMethod} onValueChange={(value) => setDisbursalData({...disbursalData, disbursalMethod: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Digital Wallet">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {disbursalData.disbursalMethod === 'Bank Transfer' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Bank Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountNumber">Account Number *</Label>
                        <Input
                          id="bankAccountNumber"
                          value={disbursalData.bankAccountNumber}
                          onChange={(e) => setDisbursalData({...disbursalData, bankAccountNumber: e.target.value})}
                          placeholder="Enter account number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Input
                          id="bankName"
                          value={disbursalData.bankName}
                          onChange={(e) => setDisbursalData({...disbursalData, bankName: e.target.value})}
                          placeholder="Enter bank name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code *</Label>
                        <Input
                          id="ifscCode"
                          value={disbursalData.ifscCode}
                          onChange={(e) => setDisbursalData({...disbursalData, ifscCode: e.target.value})}
                          placeholder="Enter IFSC code"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {disbursalData.disbursalMethod === 'Cheque' && (
                  <div className="space-y-2">
                    <Label htmlFor="chequeNumber">Cheque Number *</Label>
                    <Input
                      id="chequeNumber"
                      value={disbursalData.chequeNumber}
                      onChange={(e) => setDisbursalData({...disbursalData, chequeNumber: e.target.value})}
                      placeholder="Enter cheque number"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="processingFeeDeducted">Processing Fee Deducted (₹)</Label>
                    <Input
                      id="processingFeeDeducted"
                      type="number"
                      value={disbursalData.processingFeeDeducted}
                      onChange={(e) => setDisbursalData({...disbursalData, processingFeeDeducted: e.target.value})}
                      placeholder="Enter processing fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="netDisbursalAmount">Net Disbursal Amount (₹)</Label>
                    <Input
                      id="netDisbursalAmount"
                      type="number"
                      value={disbursalData.netDisbursalAmount}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={disbursalData.remarks}
                    onChange={(e) => setDisbursalData({...disbursalData, remarks: e.target.value})}
                    placeholder="Enter any remarks for the disbursal"
                    rows={3}
                  />
                </div>
              </div>

              {/* Disbursal Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Disbursal Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Gross Amount:</span>
                    <div className="font-medium">{formatCurrency(parseFloat(disbursalData.disbursalAmount) || 0)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Processing Fee:</span>
                    <div className="font-medium">- {formatCurrency(parseFloat(disbursalData.processingFeeDeducted) || 0)}</div>
                  </div>
                  <div className="col-span-2 pt-2 border-t">
                    <span className="text-gray-600">Net Amount to Disburse:</span>
                    <div className="font-bold text-lg text-green-600">
                      {formatCurrency(parseFloat(disbursalData.netDisbursalAmount) || 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDisbursalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDisbursalSubmit} disabled={submitting}>
                  {submitting ? 'Processing...' : 'Disburse Loan'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

