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
import { Search, Plus, User, FileText, Camera, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { customerService } from '../firebase/customerService'
import { mockCustomerService } from '../firebase/mockService'
import { imgbbService } from '../firebase/imgbbService'
import { kycService } from '../firebase/kycService'

export default function KYCRegistration({ user }) {
  const navigate = useNavigate()
  const { customerId } = useParams()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isKYCDialogOpen, setIsKYCDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [kycData, setKycData] = useState({
    idProofType: '',
    idProofNumber: '',
    idProofUrl: '',
    addressProofType: '',
    addressProofUrl: '',
    photoUrl: '',
    occupation: '',
    monthlyIncome: '',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    kycStatus: 'Pending',
    remarks: ''
  })

  // Load customers on component mount
  useEffect(() => {
    loadCustomers()
  }, [])

  // Auto-open KYC dialog for specific customer if customerId is provided in URL
  useEffect(() => {
    if (customerId && customers.length > 0) {
      const customer = customers.find(c => c.id.toString() === customerId)
      if (customer) {
        openKYCDialog(customer)
      }
    }
  }, [customerId, customers])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      let firebaseCustomers = []
      
      try {
        // Try Firebase first
        firebaseCustomers = await customerService.getAllCustomers()
      } catch (firebaseError) {
        console.warn('Firebase failed, using mock service:', firebaseError)
        // Fallback to mock service
        firebaseCustomers = await mockCustomerService.getAllCustomers()
      }
      
      setCustomers(firebaseCustomers)
    } catch (error) {
      console.error('Error loading customers:', error)
      // Fallback to mock data
      const mockCustomers = [
        {
          id: 1,
          name: 'Rajesh Kumar',
          phone: '9876543210',
          email: 'rajesh@example.com',
          address: '123 Main Street, Delhi',
          kycStatus: 'Pending',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'Priya Sharma',
          phone: '9876543211',
          email: 'priya@example.com',
          address: '456 Park Avenue, Mumbai',
          kycStatus: 'Approved',
          createdAt: '2024-02-20'
        },
        {
          id: 3,
          name: 'Amit Singh',
          phone: '9876543212',
          email: 'amit@example.com',
          address: '789 Garden Road, Bangalore',
          kycStatus: 'Rejected',
          createdAt: '2024-03-10'
        }
      ]
      setCustomers(mockCustomers)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getKYCStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Under Review': 'bg-blue-100 text-blue-800'
    }
    const icons = {
      'Pending': Clock,
      'Approved': CheckCircle,
      'Rejected': AlertCircle,
      'Under Review': FileText
    }
    const Icon = icons[status] || Clock
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const handleKYCSubmit = async () => {
    if (!kycData.idProofType || !kycData.idProofNumber || !kycData.occupation) {
      alert('Please fill all required fields')
      return
    }

    try {
      setSubmitting(true)
      
      // Prepare KYC data for Firebase
      const kycDataForFirebase = {
        customerId: selectedCustomer.id,
        ...kycData,
        kycCompletedAt: new Date().toISOString(),
        kycCompletedBy: user?.email || 'admin@mfi.com'
      }

      // Save KYC data to Firebase
      try {
        await kycService.addKycDetails(kycDataForFirebase)
      } catch (firebaseError) {
        console.warn('Firebase KYC save failed:', firebaseError)
        // Continue with local update even if Firebase fails
      }

      // Update customer with KYC data in Firebase
      try {
        await customerService.updateCustomer(selectedCustomer.id, {
          ...kycData,
          kycCompletedAt: new Date().toISOString(),
          kycCompletedBy: user?.email || 'admin@mfi.com'
        })
      } catch (firebaseError) {
        console.warn('Firebase customer update failed:', firebaseError)
      }

      // Update local customers list
      const updatedCustomer = {
        ...selectedCustomer,
        ...kycData,
        kycCompletedAt: new Date().toISOString(),
        kycCompletedBy: user?.email || 'admin@mfi.com'
      }

      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id ? updatedCustomer : customer
      ))

      // Reset form
      setKycData({
        idProofType: '',
        idProofNumber: '',
        idProofUrl: '',
        addressProofType: '',
        addressProofUrl: '',
        photoUrl: '',
        occupation: '',
        monthlyIncome: '',
        bankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        kycStatus: 'Pending',
        remarks: ''
      })
      
      setIsKYCDialogOpen(false)
      
      // Show success message briefly
      alert('KYC information saved to Firebase successfully! Redirecting to loan application...')
      
      // Redirect to loan application for the customer
      navigate(`/loan-application/${selectedCustomer.id}`)
      
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Error updating KYC:', error)
      alert('Failed to update KYC information. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const openKYCDialog = async (customer) => {
    setSelectedCustomer(customer)
    
    // Try to load existing KYC data from Firebase
    try {
      const existingKycData = await kycService.getKycDetailsByCustomerId(customer.id)
      if (existingKycData) {
        setKycData({
          idProofType: existingKycData.idProofType || '',
          idProofNumber: existingKycData.idProofNumber || '',
          idProofUrl: existingKycData.idProofUrl || '',
          addressProofType: existingKycData.addressProofType || '',
          addressProofUrl: existingKycData.addressProofUrl || '',
          photoUrl: existingKycData.photoUrl || '',
          occupation: existingKycData.occupation || '',
          monthlyIncome: existingKycData.monthlyIncome || '',
          bankAccountNumber: existingKycData.bankAccountNumber || '',
          bankName: existingKycData.bankName || '',
          ifscCode: existingKycData.ifscCode || '',
          kycStatus: existingKycData.kycStatus || 'Pending',
          remarks: existingKycData.remarks || ''
        })
      } else {
        // Pre-fill with customer data if no KYC data exists
        setKycData({
          idProofType: customer.idProofType || '',
          idProofNumber: customer.idProofNumber || '',
          idProofUrl: customer.idProofUrl || '',
          addressProofType: customer.addressProofType || '',
          addressProofUrl: customer.addressProofUrl || '',
          photoUrl: customer.photoUrl || '',
          occupation: customer.occupation || '',
          monthlyIncome: customer.monthlyIncome || '',
          bankAccountNumber: customer.bankAccountNumber || '',
          bankName: customer.bankName || '',
          ifscCode: customer.ifscCode || '',
          kycStatus: customer.kycStatus || 'Pending',
          remarks: customer.remarks || ''
        })
      }
    } catch (error) {
      console.warn('Failed to load KYC data from Firebase:', error)
      // Pre-fill with customer data as fallback
      setKycData({
        idProofType: customer.idProofType || '',
        idProofNumber: customer.idProofNumber || '',
        idProofUrl: customer.idProofUrl || '',
        addressProofType: customer.addressProofType || '',
        addressProofUrl: customer.addressProofUrl || '',
        photoUrl: customer.photoUrl || '',
        occupation: customer.occupation || '',
        monthlyIncome: customer.monthlyIncome || '',
        bankAccountNumber: customer.bankAccountNumber || '',
        bankName: customer.bankName || '',
        ifscCode: customer.ifscCode || '',
        kycStatus: customer.kycStatus || 'Pending',
        remarks: customer.remarks || ''
      })
    }
    
    setIsKYCDialogOpen(true)
  }

  const handleFileUpload = async (field, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await imgbbService.uploadImage(file);
      setKycData({...kycData, [field]: imageUrl});
      alert(`Document uploaded successfully! URL: ${imageUrl}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const getKYCCompletionPercentage = (customer) => {
    const fields = [
      customer.idProofType,
      customer.idProofNumber,
      customer.addressProofType,
      customer.occupation,
      customer.monthlyIncome,
      customer.bankAccountNumber
    ]
    const completedFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((completedFields / fields.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">KYC Registration</h1>
          <p className="text-gray-600">Manage customer KYC verification and documentation</p>
        </div>
      </div>

      {/* KYC Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Total Customers</div>
                <div className="font-medium">{customers.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">KYC Approved</div>
                <div className="font-medium">
                  {customers.filter(c => c.kycStatus === 'Approved').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-500">KYC Pending</div>
                <div className="font-medium">
                  {customers.filter(c => c.kycStatus === 'Pending' || !c.kycStatus).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm text-gray-500">KYC Rejected</div>
                <div className="font-medium">
                  {customers.filter(c => c.kycStatus === 'Rejected').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer KYC Status ({filteredCustomers.length})</CardTitle>
          <CardDescription>
            Manage KYC verification for all customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.phone}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getKYCStatusBadge(customer.kycStatus || 'Pending')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${getKYCCompletionPercentage(customer)}%`}}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {getKYCCompletionPercentage(customer)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openKYCDialog(customer)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        {customer.kycStatus === 'Approved' ? 'View' : 'Update'} KYC
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* KYC Dialog */}
      <Dialog open={isKYCDialogOpen} onOpenChange={setIsKYCDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Registration - {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              Complete KYC verification for the customer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Identity Proof Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Identity Proof</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idProofType">ID Proof Type *</Label>
                  <Select value={kycData.idProofType} onValueChange={(value) => setKycData({...kycData, idProofType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID proof type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
                      <SelectItem value="PAN Card">PAN Card</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Driving License">Driving License</SelectItem>
                      <SelectItem value="Voter ID">Voter ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idProofNumber">ID Proof Number *</Label>
                  <Input
                    id="idProofNumber"
                    value={kycData.idProofNumber}
                    onChange={(e) => setKycData({...kycData, idProofNumber: e.target.value})}
                    placeholder="Enter ID proof number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idProofUrl">ID Proof Document</Label>
                <Input
                  id="idProofUrl"
                  type="file"
                  onChange={(e) => handleFileUpload("idProofUrl", e)}
                  className="flex-1"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                {kycData.idProofUrl && (
                  <a href={kycData.idProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                    View Uploaded Document
                  </a>
                )}
              </div>
            </div>

            {/* Address Proof Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Proof</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressProofType">Address Proof Type</Label>
                  <Select value={kycData.addressProofType} onValueChange={(value) => setKycData({...kycData, addressProofType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select address proof type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Utility Bill">Utility Bill</SelectItem>
                      <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                      <SelectItem value="Rent Agreement">Rent Agreement</SelectItem>
                      <SelectItem value="Property Tax Receipt">Property Tax Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressProofUrl">Address Proof Document</Label>
                  <Input
                    id="addressProofUrl"
                    type="file"
                    onChange={(e) => handleFileUpload("addressProofUrl", e)}
                    className="flex-1"
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                  {kycData.addressProofUrl && (
                    <a href={kycData.addressProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                      View Uploaded Document
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    value={kycData.occupation}
                    onChange={(e) => setKycData({...kycData, occupation: e.target.value})}
                    placeholder="Enter occupation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={kycData.monthlyIncome}
                    onChange={(e) => setKycData({...kycData, monthlyIncome: e.target.value})}
                    placeholder="Enter monthly income"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoUrl">Customer Photo</Label>
                <Input
                  id="photoUrl"
                  type="file"
                  onChange={(e) => handleFileUpload("photoUrl", e)}
                  className="flex-1"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                {kycData.photoUrl && (
                  <a href={kycData.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                    View Uploaded Photo
                  </a>
                )}
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={kycData.bankAccountNumber}
                    onChange={(e) => setKycData({...kycData, bankAccountNumber: e.target.value})}
                    placeholder="Enter account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={kycData.bankName}
                    onChange={(e) => setKycData({...kycData, bankName: e.target.value})}
                    placeholder="Enter bank name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={kycData.ifscCode}
                    onChange={(e) => setKycData({...kycData, ifscCode: e.target.value})}
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>
            </div>

            {/* KYC Status and Remarks */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">KYC Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kycStatus">KYC Status</Label>
                  <Select value={kycData.kycStatus} onValueChange={(value) => setKycData({...kycData, kycStatus: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select KYC status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={kycData.remarks}
                  onChange={(e) => setKycData({...kycData, remarks: e.target.value})}
                  placeholder="Enter any remarks or notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsKYCDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleKYCSubmit} disabled={submitting}>
                {submitting ? 'Updating...' : 'Update KYC'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

