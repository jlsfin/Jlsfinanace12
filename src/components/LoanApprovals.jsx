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
import { Search, CheckCircle, XCircle, Eye, Clock, FileText, DollarSign, User, AlertTriangle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export default function LoanApprovals({ user }) {
  const navigate = useNavigate()
  const { applicationId } = useParams()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [approvalData, setApprovalData] = useState({
    decision: '',
    approvedAmount: '',
    approvedTenure: '',
    interestRate: '',
    processingFee: '',
    remarks: '',
    conditions: ''
  })

  // Load pending applications on component mount
  useEffect(() => {
    loadPendingApplications()
  }, [])

  // Auto-open approval dialog for specific application if applicationId is provided in URL
  useEffect(() => {
    if (applicationId && applications.length > 0) {
      const application = applications.find(app => app.applicationId === applicationId)
      if (application) {
        openApprovalDialog(application)
      }
    }
  }, [applicationId, applications])

  const loadPendingApplications = async () => {
    try {
      setLoading(true)
      // Mock loan applications data - in real app, this would come from API
      const mockApplications = [
        {
          applicationId: 'APP_001',
          customerId: 1,
          customerName: 'Rajesh Kumar',
          customerPhone: '9876543210',
          customerEmail: 'rajesh@example.com',
          requestedAmount: 100000,
          requestedTenure: 24,
          requestedPurpose: 'Business Expansion',
          applicationDate: '2024-07-01',
          applicationStatus: 'Pending',
          monthlyIncome: 25000,
          existingLoans: 'None',
          collateralType: 'Property',
          collateralValue: 500000,
          guarantorName: 'Suresh Kumar',
          guarantorPhone: '9876543213',
          creditScore: 750,
          documents: [
            { documentType: 'Income Proof', documentUrl: 'https://example.com/income.pdf' },
            { documentType: 'Bank Statement', documentUrl: 'https://example.com/bank.pdf' }
          ],
          appliedBy: 'customer',
          riskLevel: 'Low'
        },
        {
          applicationId: 'APP_002',
          customerId: 2,
          customerName: 'Priya Sharma',
          customerPhone: '9876543211',
          customerEmail: 'priya@example.com',
          requestedAmount: 50000,
          requestedTenure: 12,
          requestedPurpose: 'Home Renovation',
          applicationDate: '2024-07-05',
          applicationStatus: 'Under Review',
          monthlyIncome: 30000,
          existingLoans: 'Personal Loan - ₹15,000',
          collateralType: 'None',
          collateralValue: 0,
          guarantorName: '',
          guarantorPhone: '',
          creditScore: 680,
          documents: [
            { documentType: 'Income Proof', documentUrl: 'https://example.com/income2.pdf' }
          ],
          appliedBy: 'agent',
          riskLevel: 'Medium'
        },
        {
          applicationId: 'APP_004',
          customerId: 4,
          customerName: 'Sunita Devi',
          customerPhone: '9876543214',
          customerEmail: 'sunita@example.com',
          requestedAmount: 25000,
          requestedTenure: 6,
          requestedPurpose: 'Medical Emergency',
          applicationDate: '2024-07-08',
          applicationStatus: 'Pending',
          monthlyIncome: 15000,
          existingLoans: 'None',
          collateralType: 'Gold',
          collateralValue: 50000,
          guarantorName: 'Ram Devi',
          guarantorPhone: '9876543215',
          creditScore: 620,
          documents: [
            { documentType: 'Medical Bills', documentUrl: 'https://example.com/medical.pdf' },
            { documentType: 'Income Proof', documentUrl: 'https://example.com/income3.pdf' }
          ],
          appliedBy: 'customer',
          riskLevel: 'High'
        }
      ]
      setApplications(mockApplications)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications.filter(app =>
    app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.customerPhone?.includes(searchTerm) ||
    app.requestedPurpose?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    }
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>
  }

  const getRiskBadge = (riskLevel) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    }
    return <Badge className={colors[riskLevel] || 'bg-gray-100 text-gray-800'}>{riskLevel}</Badge>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const openApprovalDialog = (application) => {
    setSelectedApplication(application)
    setApprovalData({
      decision: '',
      approvedAmount: application.requestedAmount.toString(),
      approvedTenure: application.requestedTenure.toString(),
      interestRate: '12',
      processingFee: '1000',
      remarks: '',
      conditions: ''
    })
    setIsApprovalDialogOpen(true)
  }

  const viewApplication = (application) => {
    setSelectedApplication(application)
    setIsViewDialogOpen(true)
  }

  const handleApprovalSubmit = async () => {
    if (!approvalData.decision) {
      alert('Please select approval decision')
      return
    }

    if (approvalData.decision === 'Approved' && (!approvalData.approvedAmount || !approvalData.interestRate)) {
      alert('Please fill all required fields for approval')
      return
    }

    try {
      setSubmitting(true)
      
      const updatedApplication = {
        ...selectedApplication,
        applicationStatus: approvalData.decision,
        approvedAmount: approvalData.decision === 'Approved' ? parseFloat(approvalData.approvedAmount) : null,
        approvedTenure: approvalData.decision === 'Approved' ? parseInt(approvalData.approvedTenure) : null,
        interestRate: approvalData.decision === 'Approved' ? parseFloat(approvalData.interestRate) : null,
        processingFee: approvalData.decision === 'Approved' ? parseFloat(approvalData.processingFee) : null,
        approvalRemarks: approvalData.remarks,
        approvalConditions: approvalData.conditions,
        approvedBy: user?.email || 'admin@mfi.com',
        approvalDate: new Date().toISOString().split('T')[0]
      }

      // Update applications list
      setApplications(applications.map(app => 
        app.applicationId === selectedApplication.applicationId ? updatedApplication : app
      ))

      setIsApprovalDialogOpen(false)
      
      // Show success message and redirect based on decision
      if (approvalData.decision === 'Approved') {
        alert(`Application approved successfully! Redirecting to loan disbursal...`)
        // Redirect to loan disbursal for approved applications
        navigate(`/loan-disbursal/${selectedApplication.applicationId}`)
      } else {
        alert(`Application ${approvalData.decision.toLowerCase()} successfully!`)
      }
      
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Failed to process approval. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateEMI = (amount, rate, tenure) => {
    const monthlyRate = rate / 100 / 12
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                 (Math.pow(1 + monthlyRate, tenure) - 1)
    return Math.round(emi)
  }

  const getRecommendation = (application) => {
    const { creditScore, monthlyIncome, requestedAmount, collateralValue, existingLoans } = application
    
    let score = 0
    let reasons = []

    // Credit score evaluation
    if (creditScore >= 750) {
      score += 40
      reasons.push('Excellent credit score')
    } else if (creditScore >= 700) {
      score += 30
      reasons.push('Good credit score')
    } else if (creditScore >= 650) {
      score += 20
      reasons.push('Fair credit score')
    } else {
      score += 10
      reasons.push('Poor credit score')
    }

    // Income to loan ratio
    const loanToIncomeRatio = requestedAmount / (monthlyIncome * 12)
    if (loanToIncomeRatio <= 3) {
      score += 25
      reasons.push('Good income to loan ratio')
    } else if (loanToIncomeRatio <= 5) {
      score += 15
      reasons.push('Acceptable income to loan ratio')
    } else {
      score += 5
      reasons.push('High income to loan ratio')
    }

    // Collateral evaluation
    if (collateralValue >= requestedAmount * 1.5) {
      score += 20
      reasons.push('Strong collateral coverage')
    } else if (collateralValue >= requestedAmount) {
      score += 15
      reasons.push('Adequate collateral coverage')
    } else if (collateralValue > 0) {
      score += 10
      reasons.push('Partial collateral coverage')
    } else {
      score += 5
      reasons.push('No collateral provided')
    }

    // Existing loans
    if (existingLoans === 'None' || !existingLoans) {
      score += 15
      reasons.push('No existing loan burden')
    } else {
      score += 5
      reasons.push('Has existing loans')
    }

    let recommendation = 'Reject'
    if (score >= 80) {
      recommendation = 'Approve'
    } else if (score >= 60) {
      recommendation = 'Approve with conditions'
    } else if (score >= 40) {
      recommendation = 'Review required'
    }

    return { recommendation, score, reasons }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loan Approvals</h1>
          <p className="text-gray-600">Review and approve loan applications</p>
        </div>
      </div>

      {/* Approval Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-500">Pending Review</div>
                <div className="font-medium">
                  {applications.filter(app => app.applicationStatus === 'Pending').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Under Review</div>
                <div className="font-medium">
                  {applications.filter(app => app.applicationStatus === 'Under Review').length}
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
                <div className="text-sm text-gray-500">Approved Today</div>
                <div className="font-medium">
                  {applications.filter(app => 
                    app.applicationStatus === 'Approved' && 
                    app.approvalDate === new Date().toISOString().split('T')[0]
                  ).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-medium">
                  {formatCurrency(applications.reduce((sum, app) => sum + app.requestedAmount, 0))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by application ID, customer name, phone, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications for Approval ({filteredApplications.length})</CardTitle>
          <CardDescription>
            Applications pending review and approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Loan Details</TableHead>
                  <TableHead>Risk Assessment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => {
                  const recommendation = getRecommendation(application)
                  return (
                    <TableRow key={application.applicationId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.applicationId}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(application.applicationDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.customerName}</div>
                          <div className="text-sm text-gray-500">{application.customerPhone}</div>
                          <div className="text-sm text-gray-500">Score: {application.creditScore}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(application.requestedAmount)}</div>
                          <div className="text-sm text-gray-500">
                            {application.requestedTenure} months - {application.requestedPurpose}
                          </div>
                          <div className="text-sm text-gray-500">
                            Income: {formatCurrency(application.monthlyIncome)}/month
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getRiskBadge(application.riskLevel)}
                          <div className="text-sm text-gray-600">
                            {recommendation.recommendation}
                          </div>
                          <div className="text-xs text-gray-500">
                            Score: {recommendation.score}/100
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.applicationStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewApplication(application)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(application.applicationStatus === 'Pending' || application.applicationStatus === 'Under Review') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openApprovalDialog(application)}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Approval - {selectedApplication?.applicationId}</DialogTitle>
            <DialogDescription>
              Review and approve/reject the loan application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Application Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Application Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <div className="font-medium">{selectedApplication.customerName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Requested Amount:</span>
                    <div className="font-medium">{formatCurrency(selectedApplication.requestedAmount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tenure:</span>
                    <div className="font-medium">{selectedApplication.requestedTenure} months</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Purpose:</span>
                    <div className="font-medium">{selectedApplication.requestedPurpose}</div>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">AI Risk Assessment</h3>
                {(() => {
                  const recommendation = getRecommendation(selectedApplication)
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Recommendation:</span>
                        <Badge className={
                          recommendation.recommendation === 'Approve' ? 'bg-green-100 text-green-800' :
                          recommendation.recommendation === 'Approve with conditions' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {recommendation.recommendation}
                        </Badge>
                        <span className="text-sm text-gray-600">Score: {recommendation.score}/100</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Key factors:</span>
                        <ul className="list-disc list-inside mt-1">
                          {recommendation.reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Approval Decision */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Approval Decision</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decision">Decision *</Label>
                    <Select value={approvalData.decision} onValueChange={(value) => setApprovalData({...approvalData, decision: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved">Approve</SelectItem>
                        <SelectItem value="Rejected">Reject</SelectItem>
                        <SelectItem value="Under Review">Need More Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {approvalData.decision === 'Approved' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Approval Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="approvedAmount">Approved Amount (₹) *</Label>
                        <Input
                          id="approvedAmount"
                          type="number"
                          value={approvalData.approvedAmount}
                          onChange={(e) => setApprovalData({...approvalData, approvedAmount: e.target.value})}
                          placeholder="Enter approved amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approvedTenure">Approved Tenure (Months) *</Label>
                        <Input
                          id="approvedTenure"
                          type="number"
                          value={approvalData.approvedTenure}
                          onChange={(e) => setApprovalData({...approvalData, approvedTenure: e.target.value})}
                          placeholder="Enter approved tenure"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interestRate">Interest Rate (% per annum) *</Label>
                        <Input
                          id="interestRate"
                          type="number"
                          step="0.1"
                          value={approvalData.interestRate}
                          onChange={(e) => setApprovalData({...approvalData, interestRate: e.target.value})}
                          placeholder="Enter interest rate"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="processingFee">Processing Fee (₹)</Label>
                        <Input
                          id="processingFee"
                          type="number"
                          value={approvalData.processingFee}
                          onChange={(e) => setApprovalData({...approvalData, processingFee: e.target.value})}
                          placeholder="Enter processing fee"
                        />
                      </div>
                    </div>

                    {approvalData.approvedAmount && approvalData.interestRate && approvalData.approvedTenure && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium">Calculated EMI: </span>
                          {formatCurrency(calculateEMI(
                            parseFloat(approvalData.approvedAmount),
                            parseFloat(approvalData.interestRate),
                            parseInt(approvalData.approvedTenure)
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="conditions">Approval Conditions</Label>
                      <Textarea
                        id="conditions"
                        value={approvalData.conditions}
                        onChange={(e) => setApprovalData({...approvalData, conditions: e.target.value})}
                        placeholder="Enter any conditions for approval"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={approvalData.remarks}
                    onChange={(e) => setApprovalData({...approvalData, remarks: e.target.value})}
                    placeholder="Enter remarks for the decision"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApprovalSubmit} disabled={submitting}>
                  {submitting ? 'Processing...' : 'Submit Decision'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.applicationId}</DialogTitle>
            <DialogDescription>
              Complete loan application information
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedApplication.customerName}</div>
                    <div><span className="font-medium">Phone:</span> {selectedApplication.customerPhone}</div>
                    <div><span className="font-medium">Email:</span> {selectedApplication.customerEmail}</div>
                    <div><span className="font-medium">Monthly Income:</span> {formatCurrency(selectedApplication.monthlyIncome)}</div>
                    <div><span className="font-medium">Credit Score:</span> {selectedApplication.creditScore}</div>
                    <div><span className="font-medium">Existing Loans:</span> {selectedApplication.existingLoans || 'None'}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Loan Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Requested Amount:</span> {formatCurrency(selectedApplication.requestedAmount)}</div>
                    <div><span className="font-medium">Tenure:</span> {selectedApplication.requestedTenure} months</div>
                    <div><span className="font-medium">Purpose:</span> {selectedApplication.requestedPurpose}</div>
                    <div><span className="font-medium">Application Date:</span> {new Date(selectedApplication.applicationDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Applied By:</span> {selectedApplication.appliedBy}</div>
                  </div>
                </div>

                {(selectedApplication.collateralType && selectedApplication.collateralType !== 'None') && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Collateral Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Type:</span> {selectedApplication.collateralType}</div>
                      <div><span className="font-medium">Value:</span> {formatCurrency(selectedApplication.collateralValue)}</div>
                    </div>
                  </div>
                )}

                {selectedApplication.guarantorName && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Guarantor Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedApplication.guarantorName}</div>
                      <div><span className="font-medium">Phone:</span> {selectedApplication.guarantorPhone}</div>
                    </div>
                  </div>
                )}
              </div>

              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Documents</h3>
                  <div className="space-y-1">
                    {selectedApplication.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span>{doc.documentType}</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

