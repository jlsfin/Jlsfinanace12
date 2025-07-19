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
import { Search, Plus, Edit, Eye, Phone, Mail, MapPin, Loader2, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { customerService } from '../firebase/customerService'
import { loanService } from '../firebase/loanService'
import { mockCustomerService } from '../firebase/mockService'
import { downloadCustomerListCSV } from '../utils/downloadUtils'

// Mock customer data for fallback
const mockCustomers = [
  {
    id: 1,
    fullName: 'Rajesh Kumar',
    phoneNumber: '9876543210',
    email: 'rajesh@example.com',
    address: '123 Main St, Delhi',
    aadharNumber: '1234-5678-9012',
    panNumber: 'ABCDE1234F',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    creditScore: 750
  },
  {
    id: 2,
    fullName: 'Priya Sharma',
    phoneNumber: '9876543211',
    email: 'priya@example.com',
    address: '456 Park Ave, Mumbai',
    aadharNumber: '2345-6789-0123',
    panNumber: 'BCDEF2345G',
    status: 'active',
    createdAt: new Date('2024-02-20'),
    creditScore: 720
  },
  {
    id: 3,
    fullName: 'Amit Singh',
    phoneNumber: '9876543212',
    email: 'amit@example.com',
    address: '789 Oak St, Bangalore',
    aadharNumber: '3456-7890-1234',
    panNumber: 'CDEFG3456H',
    status: 'inactive',
    createdAt: new Date('2023-12-10'),
    creditScore: 680
  }
]

export default function CustomerManagement({ user }) {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    aadharNumber: '',
    panNumber: ''
  })

  // Load customers from Firebase on component mount
  useEffect(() => {
    loadCustomers()
  }, [])

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
      // Final fallback to static mock data
      setCustomers(mockCustomers)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    (customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || customer.status === statusFilter)
  )
  const handleAddCustomer = async () => {
    try {
      setAddingCustomer(true)
      let addedCustomer
      
      try {
        // Try Firebase first
        addedCustomer = await customerService.addCustomer(newCustomer)
      } catch (firebaseError) {
        console.warn('Firebase failed, using mock service:', firebaseError)
        // Fallback to mock service
        addedCustomer = await mockCustomerService.addCustomer(newCustomer)
      }
      
      setCustomers([addedCustomer, ...customers])
      setNewCustomer({
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        aadharNumber: '',
        panNumber: ''
      })
      setIsAddDialogOpen(false)
      
      // Show success message briefly
      alert('Customer added successfully! Redirecting to KYC registration...')
      
      // Redirect to KYC registration for the newly added customer
      navigate(`/kyc-registration/${addedCustomer.id}`)
      
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('Failed to add customer. Please try again.')
    } finally {
      setAddingCustomer(false)
    }
  }

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const getCreditScoreBadge = (score) => {
    if (score >= 750) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 700) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (score >= 650) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsViewDialogOpen(true)
  }

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    // In a real app, you'd open an edit dialog here
    alert(`Editing customer: ${customer.fullName}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer information and accounts</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={downloadCustomerListCSV} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download List
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Customers ({filteredCustomers.length})</CardTitle>
          <CardDescription>Complete list of customers and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Customer Details</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900 hidden sm:table-cell">Contact</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900 hidden md:table-cell">Location</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div>
                        <div className="font-medium text-gray-900">{customer.fullName}</div>
                        <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{customer.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="py-4 px-2 hidden sm:table-cell">
                      <div>
                        <div className="text-sm text-gray-900">{customer.phoneNumber}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-2 hidden md:table-cell">
                      <div className="text-sm text-gray-900">{customer.address}</div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge 
                        variant={customer.status === 'active' ? 'default' :
                                customer.status === 'inactive' ? 'secondary' : 'outline'}
                        className="capitalize"
                      >
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCustomer(customer)}
                          className="text-xs"
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditCustomer(customer)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter customer details to create a new profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={newCustomer.fullName}
                onChange={(e) => setNewCustomer({...newCustomer, fullName: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={newCustomer.phoneNumber}
                onChange={(e) => setNewCustomer({...newCustomer, phoneNumber: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                placeholder="Enter full address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadharNumber">Aadhar Number</Label>
              <Input
                id="aadharNumber"
                value={newCustomer.aadharNumber}
                onChange={(e) => setNewCustomer({...newCustomer, aadharNumber: e.target.value})}
                placeholder="XXXX-XXXX-XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={newCustomer.panNumber}
                onChange={(e) => setNewCustomer({...newCustomer, panNumber: e.target.value})}
                placeholder="ABCDE1234F"
              />
            </div>
            <Button onClick={handleAddCustomer} className="w-full" disabled={addingCustomer}>
              {addingCustomer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Customer...
                </>
              ) : (
                'Add Customer'
              )}
            </Button>
          </div>
          </DialogContent>
        </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen && selectedCustomer} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedCustomer?.fullName}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Name:</span>
                      <span className="font-medium">{selectedCustomer.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone Number:</span>
                      <span>{selectedCustomer.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span>{selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Identification</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aadhar Number:</span>
                      <span>{selectedCustomer.aadharNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PAN Number:</span>
                      <span>{selectedCustomer.panNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Account Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credit Score:</span>
                      <div className="flex items-center gap-2">
                        <span>{selectedCustomer.creditScore}</span>
                        {getCreditScoreBadge(selectedCustomer.creditScore)}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Loan Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Loans:</span>
                      <span>{selectedCustomer.totalLoans || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Loans:</span>
                      <span>{selectedCustomer.activeLoans || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


