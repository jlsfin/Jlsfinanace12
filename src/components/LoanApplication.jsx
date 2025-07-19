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
import { Search, Plus, FileText, Upload, Eye, Calendar, DollarSign, User, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { customerService } from '../firebase/customerService'
import { mockCustomerService } from '../firebase/mockService'

export default function LoanApplication({ user }) {
  const navigate = useNavigate()
  const { customerId } = useParams()
  const [applications, setApplications] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState({
    customerId: '',
    requestedAmount: '',
    requestedTenure: '',
    requestedPurpose: '',
    monthlyIncome: '',
    existingLoans: '',
    collateralType: '',
    collateralValue: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorRelation: '',
    documents: [],
    applicationStatus: 'Pending',
    remarks: ''
  })

  // Load applications and customers on component mount
  useEffect(() => {
    loadApplications()
    loadCustomers()
  }, [])

  // Auto-open application dialog for specific customer if customerId is provided in URL
  useEffect(() => {
    if (customerId && customers.length > 0) {
      const customer = customers.find(c => c.id.toString() === customerId)
      if (customer) {
        setApplicationData(prev => ({
          ...prev,
          customerId: customerId
        }))
        setIsApplicationDialogOpen(true)
      }
    }
  }, [customerId, customers])

  const loadApplications = async () => {
    try {
      setLoading(true)
      // Mock loan applications data
      const mockApplications = [
        {
          applicationId: 'APP_001',
          customerId: 1,
          customerName: 'Rajesh Kumar',
          customerPhone: '9876543210',
          requestedAmount: 100000,
          requestedTenure: 24,
          requestedPurpose: 'Business Expansion',
          applicationDate: '2024-07-01',
          applicationStatus: 'Pending',
          monthlyIncome: 25000,
          existingLoans: 'None',
          appliedBy: 'customer'
        },
        {
          applicationId: 'APP_002',
          customerId: 2,
          customerName: 'Priya Sharma',
          customerPhone: '9876543211',
          requestedAmount: 50000,
          requestedTenure: 12,
          requestedPurpose: 'Home Renovation',
          applicationDate: '2024-07-05',
          applicationStatus: 'Under Review',
          monthlyIncome: 30000,
          existingLoans: 'Personal Loan - ₹15,000',
          appliedBy: 'agent'
        },
        {
          applicationId: 'APP_003',
          customerId: 3,
          customerName: 'Amit Singh',
          customerPhone: '9876543212',
          requestedAmount: 75000,
          requestedTenure: 18,
          requestedPurpose: 'Education',
          applicationDate: '2024-06-28',
          applicationStatus: 'Approved',
          monthlyIncome: 35000,
          existingLoans: 'None',
          appliedBy: 'customer'
        }
      ]
      setApplications(mockApplications)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      let firebaseCustomers = []
      
      try {
        // Try Firebase first
        firebaseCustomers = await customerService.getAllCustomers()
        console.log('Firebase customers loaded:', firebaseCustomers)
      } catch (firebaseError) {
        console.warn('Firebase failed, using mock service:', firebaseError)
        // Fallback to mock service
        firebaseCustomers = await mockCustomerService.getAllCustomers()
        console.log('Mock customers loaded:', firebaseCustomers)
      }
      
      // Show all customers (no KYC filtering)
      console.log('All customers:', firebaseCustomers)
      setCustomers(firebaseCustomers)
    } catch (error) {
      console.error("Error loading customers:", error)
      // Fallback to mock data
      const mockCustomers = [
        {
          id: 1,
          name: 'Rajesh Kumar',
          phone: '9876543210',
          email: 'rajesh@example.com',
          kycStatus: 'Pending'
        },
        {
          id: 2,
          name: 'Priya Sharma',
          phone: '9876543211',
          email: 'priya@example.com',
          kycStatus: 'Approved'
        },
        {
          id: 3,
          name: 'Amit Singh',
          phone: '9876543212',
          email: 'amit@example.com',
          kycStatus: 'Pending'
        }
      ]
      setCustomers(mockCustomers)
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
    const icons = {
      'Pending': Clock,
      'Under Review': FileText,
      'Approved': CheckCircle,
      'Rejected': AlertCircle
    }
    const Icon = icons[status] || Clock
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const handleApplicationSubmit = async () => {
    if (!applicationData.customerId || !applicationData.requestedAmount || !applicationData.requestedTenure || !applicationData.requestedPurpose) {
      alert('Please fill all required fields')
      return
    }

    try {
      setSubmitting(true)
      
      const selectedCustomer = customers.find(c => c.id.toString() === applicationData.customerId)
      
      const newApplication = {
        applicationId: `APP_${Date.now()}`,
        customerId: parseInt(applicationData.customerId),
        customerName: selectedCustomer?.name || 'Unknown',
        customerPhone: selectedCustomer?.phone || 'Unknown',
        ...applicationData,
        requestedAmount: parseFloat(applicationData.requestedAmount),
        requestedTenure: parseInt(applicationData.requestedTenure),
        applicationDate: new Date().toISOString().split('T')[0],
        appliedBy: user?.email || 'admin@mfi.com'
      }

      // Add to applications list
      setApplications([newApplication, ...applications])

      // Reset form
      setApplicationData({
        customerId: '',
        requestedAmount: '',
        requestedTenure: '',
        requestedPurpose: '',
        monthlyIncome: '',
        existingLoans: '',
        collateralType: '',
        collateralValue: '',
        guarantorName: '',
        guarantorPhone: '',
        guarantorRelation: '',
        documents: [],
        applicationStatus: 'Pending',
        remarks: ''
      })
      
      setIsApplicationDialogOpen(false)
      
      // Show success message briefly
      alert('Loan application submitted successfully! Redirecting to loan approvals...')
      
      // Redirect to loan approvals for the newly submitted application
      navigate(`/loan-approvals/${newApplication.applicationId}`)
      
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = (documentType) => {
    // Simulate file upload - in real implementation, this would upload to a service
    const mockUrl = `https://example.com/documents/${documentType}_${Date.now()}.pdf`
    const newDocument = {
      documentType,
      documentUrl: mockUrl,
      uploadedAt: new Date().toISOString()
    }
    setApplicationData({
      ...applicationData,
      documents: [...applicationData.documents, newDocument]
    })
    alert(`Document uploaded successfully! URL: ${mockUrl}`)
  }

  const removeDocument = (index) => {
    const updatedDocuments = applicationData.documents.filter((_, i) => i !== index)
    setApplicationData({...applicationData, documents: updatedDocuments})
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const viewApplication = (application) => {
    setSelectedApplication(application)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loan Applications</h1>
          <p className="text-gray-600">Manage customer loan applications</p>
        </div>
        <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Loan Application</DialogTitle>
              <DialogDescription>
                Submit a new loan application for a customer
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="customerId">Select Customer * ({customers.length} customers available)</Label>
                  <Select value={applicationData.customerId} onValueChange={(value) => setApplicationData({...applicationData, customerId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={customers.length > 0 ? "Select a customer" : "No customers found"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.length > 0 ? (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-customers" disabled>
                          No customers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {customers.length === 0 && (
                    <p className="text-sm text-red-600">
                      No customers found. Please add customers first.
                    </p>
                  )}
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Loan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requestedAmount">Requested Amount (₹) *</Label>
                    <Input
                      id="requestedAmount"
                      type="number"
                      value={applicationData.requestedAmount}
                      onChange={(e) => setApplicationData({...applicationData, requestedAmount: e.target.value})}
                      placeholder="Enter loan amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requestedTenure">Tenure (Months) *</Label>
                    <Input
                      id="requestedTenure"
                      type="number"
                      value={applicationData.requestedTenure}
                      onChange={(e) => setApplicationData({...applicationData, requestedTenure: e.target.value})}
                      placeholder="Enter tenure in months"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requestedPurpose">Loan Purpose *</Label>
                    <Select value={applicationData.requestedPurpose} onValueChange={(value) => setApplicationData({...applicationData, requestedPurpose: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business Expansion">Business Expansion</SelectItem>
                        <SelectItem value="Working Capital">Working Capital</SelectItem>
                        <SelectItem value="Equipment Purchase">Equipment Purchase</SelectItem>
                        <SelectItem value="Home Renovation">Home Renovation</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={applicationData.monthlyIncome}
                      onChange={(e) => setApplicationData({...applicationData, monthlyIncome: e.target.value})}
                      placeholder="Enter monthly income"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="existingLoans">Existing Loans</Label>
                    <Input
                      id="existingLoans"
                      value={applicationData.existingLoans}
                      onChange={(e) => setApplicationData({...applicationData, existingLoans: e.target.value})}
                      placeholder="Details of existing loans (if any)"
                    />
                  </div>
                </div>
              </div>

              {/* Collateral Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Collateral Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collateralType">Collateral Type</Label>
                    <Select value={applicationData.collateralType} onValueChange={(value) => setApplicationData({...applicationData, collateralType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collateral type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Property">Property</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Vehicle">Vehicle</SelectItem>
                        <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collateralValue">Collateral Value (₹)</Label>
                    <Input
                      id="collateralValue"
                      type="number"
                      value={applicationData.collateralValue}
                      onChange={(e) => setApplicationData({...applicationData, collateralValue: e.target.value})}
                      placeholder="Enter collateral value"
                    />
                  </div>
                </div>
              </div>

              {/* Guarantor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Guarantor Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guarantorName">Guarantor Name</Label>
                    <Input
                      id="guarantorName"
                      value={applicationData.guarantorName}
                      onChange={(e) => setApplicationData({...applicationData, guarantorName: e.target.value})}
                      placeholder="Enter guarantor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantorPhone">Guarantor Phone</Label>
                    <Input
                      id="guarantorPhone"
                      value={applicationData.guarantorPhone}
                      onChange={(e) => setApplicationData({...applicationData, guarantorPhone: e.target.value})}
                      placeholder="Enter guarantor phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantorRelation">Relation</Label>
                    <Input
                      id="guarantorRelation"
                      value={applicationData.guarantorRelation}
                      onChange={(e) => setApplicationData({...applicationData, guarantorRelation: e.target.value})}
                      placeholder="Relation with guarantor"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Supporting Documents</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["Income Proof", "Bank Statement", "Business License", "Property Papers"].map((docType) => (
                    <Button
                      key={docType}
                      type="button"
                      variant="outline"
                      onClick={() => handleFileUpload(docType)}
                      className="text-sm"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {docType}
                    </Button>
                  ))}
                </div>
                {applicationData.documents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Documents:</Label>
                    <div className="space-y-1">
                      {applicationData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{doc.documentType}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={applicationData.remarks}
                  onChange={(e) => setApplicationData({...applicationData, remarks: e.target.value})}
                  placeholder="Enter any additional remarks"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsApplicationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApplicationSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Application Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Total Applications</div>
                <div className="font-medium">{applications.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-500">Pending</div>
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
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">Approved</div>
                <div className="font-medium">
                  {applications.filter(app => app.applicationStatus === 'Approved').length}
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
          <CardTitle>Loan Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            All loan applications with their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Loan Details</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.applicationId}>
                    <TableCell>
                      <div className="font-medium">{application.applicationId}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.customerName}</div>
                        <div className="text-sm text-gray-500">{application.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrency(application.requestedAmount)}</div>
                        <div className="text-sm text-gray-500">
                          {application.requestedTenure} months - {application.requestedPurpose}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(application.applicationDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.applicationStatus)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.applicationId}</DialogTitle>
            <DialogDescription>
              Complete loan application information
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Customer:</span>
                  <div>{selectedApplication.customerName}</div>
                  <div className="text-gray-500">{selectedApplication.customerPhone}</div>
                </div>
                <div>
                  <span className="font-medium">Application Date:</span>
                  <div>{new Date(selectedApplication.applicationDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-medium">Requested Amount:</span>
                  <div>{formatCurrency(selectedApplication.requestedAmount)}</div>
                </div>
                <div>
                  <span className="font-medium">Tenure:</span>
                  <div>{selectedApplication.requestedTenure} months</div>
                </div>
                <div>
                  <span className="font-medium">Purpose:</span>
                  <div>{selectedApplication.requestedPurpose}</div>
                </div>
                <div>
                  <span className="font-medium">Monthly Income:</span>
                  <div>{selectedApplication.monthlyIncome ? formatCurrency(selectedApplication.monthlyIncome) : 'Not provided'}</div>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Existing Loans:</span>
                  <div>{selectedApplication.existingLoans || 'None'}</div>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedApplication.applicationStatus)}</div>
                </div>
              </div>
              
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

