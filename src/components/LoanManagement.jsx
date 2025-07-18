import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Search, Plus, Eye, Download, Send, Calculator, CreditCard, Calendar, DollarSign, Upload, Loader2, Image } from 'lucide-react'
import { loanService } from '../firebase/loanService'
import { customerService } from '../firebase/customerService'
import { mockLoanService, mockCustomerService } from '../firebase/mockService'
import { uploadImage } from '../utils/imageUpload'
import { downloadEMIScheduleCSV, downloadLoanDetailsPDF, generateEMISchedule } from '../utils/downloadUtils'

// Mock loan data
const mockLoans = [
  {
    id: 'L001',
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
    purpose: 'Business Expansion'
  },
  {
    id: 'L002',
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
    purpose: 'Home Renovation'
  },
  {
    id: 'L003',
    customerId: 3,
    customerName: 'Amit Singh',
    customerPhone: '9876543212',
    amount: 30000,
    interestRate: 15,
    tenure: 18,
    monthlyEMI: 1956,
    status: 'completed',
    disbursedDate: '2023-06-10',
    nextDueDate: null,
    totalPaid: 35208,
    remainingAmount: 0,
    completedEMIs: 18,
    purpose: 'Education'
  }
]

export default function LoanManagement({ user }) {
  const [loans, setLoans] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEMICalculatorOpen, setIsEMICalculatorOpen] = useState(false)
  const [isAddLoanDialogOpen, setIsAddLoanDialogOpen] = useState(false)
  const [addingLoan, setAddingLoan] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingIdCard, setUploadingIdCard] = useState(false)
  const [calculatorValues, setCalculatorValues] = useState({
    principal: '',
    rate: '',
    tenure: ''
  })
  const [newLoanData, setNewLoanData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    amount: '',
    interestRate: '12',
    tenure: '',
    purpose: '',
    processingFees: '',
    photoUrl: '',
    idCardUrl: ''
  })

  // Load data from Firebase on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      let firebaseLoans = []
      let firebaseCustomers = []
      
      try {
        // Try Firebase first
        const [loans, customers] = await Promise.all([
          loanService.getAllLoans(),
          customerService.getAllCustomers()
        ])
        firebaseLoans = loans
        firebaseCustomers = customers
      } catch (firebaseError) {
        console.warn('Firebase failed, using mock service:', firebaseError)
        // Fallback to mock service
        const [loans, customers] = await Promise.all([
          mockLoanService.getAllLoans(),
          mockCustomerService.getAllCustomers()
        ])
        firebaseLoans = loans
        firebaseCustomers = customers
      }
      
      setLoans(firebaseLoans)
      setCustomers(firebaseCustomers)
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to mock data
      setLoans(mockLoans)
      setCustomers(mockCustomers)
    } finally {
      setLoading(false)
    }
  }

  // Mock customer data for fallback
  const mockCustomers = [
    { id: 1, fullName: 'Rajesh Kumar', phoneNumber: '9876543210' },
    { id: 2, fullName: 'Priya Sharma', phoneNumber: '9876543211' },
    { id: 3, fullName: 'Amit Singh', phoneNumber: '9876543212' },
    { id: 4, fullName: 'Test Customer', phoneNumber: '9876543213' }
  ]

  const filteredLoans = loans.filter(loan =>
    loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customerPhone?.includes(searchTerm)
  )

  // Handle photo upload
  const handlePhotoUpload = async (file, type) => {
    try {
      if (type === 'photo') {
        setUploadingPhoto(true)
      } else {
        setUploadingIdCard(true)
      }

      const uploadResult = await uploadImage(file)
      
      if (type === 'photo') {
        setNewLoanData({ ...newLoanData, photoUrl: uploadResult.url })
      } else {
        setNewLoanData({ ...newLoanData, idCardUrl: uploadResult.url })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      if (type === 'photo') {
        setUploadingPhoto(false)
      } else {
        setUploadingIdCard(false)
      }
    }
  }

  const handleAddLoan = async () => {
    if (!newLoanData.customerId || !newLoanData.amount || !newLoanData.tenure || !newLoanData.purpose) {
      alert('Please fill all required fields')
      return
    }

    try {
      setAddingLoan(true)
      let addedLoan
      
      try {
        // Try Firebase first
        addedLoan = await loanService.addLoan({
          ...newLoanData,
          processingFees: parseFloat(newLoanData.processingFees) || 0
        })
      } catch (firebaseError) {
        console.warn('Firebase failed, using mock service:', firebaseError)
        // Fallback to mock service
        addedLoan = await mockLoanService.addLoan({
          ...newLoanData,
          processingFees: parseFloat(newLoanData.processingFees) || 0
        })
      }
      
      setLoans([addedLoan, ...loans])
      setNewLoanData({
        customerId: '',
        customerName: '',
        customerPhone: '',
        amount: '',
        interestRate: '12',
        tenure: '',
        purpose: '',
        processingFees: '',
        photoUrl: '',
        idCardUrl: ''
      })
      setIsAddLoanDialogOpen(false)
      alert('Loan added successfully!')
    } catch (error) {
      console.error('Error adding loan:', error)
      alert('Failed to add loan. Please try again.')
    } finally {
      setAddingLoan(false)
    }
  }

  const handleCustomerSelect = (customerId) => {
    const selectedCustomer = customers.find(c => String(c.id) === String(customerId))
    if (selectedCustomer) {
      setNewLoanData({
        ...newLoanData,
        customerId: String(customerId),
        customerName: selectedCustomer.fullName || selectedCustomer.name,
        customerPhone: selectedCustomer.phoneNumber || selectedCustomer.phone
      })
    }
  }

  const handleAddLoanOld = () => {
    if (!newLoanData.customerName || !newLoanData.amount || !newLoanData.tenure || !newLoanData.purpose) {
      alert('Please fill all required fields')
      return
    }

    const selectedCustomer = customers.find(c => (c.fullName || c.name) === newLoanData.customerName)
    const principal = parseFloat(newLoanData.amount)
    const rate = parseFloat(newLoanData.interestRate)
    const tenure = parseInt(newLoanData.tenure)
    
    // Calculate EMI
    const monthlyRate = rate / 100 / 12
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1)

    const newLoan = {
      id: `L${String(loans.length + 1).padStart(3, '0')}`,
      customerId: selectedCustomer?.id || loans.length + 1,
      customerName: newLoanData.customerName,
      customerPhone: selectedCustomer?.phone || newLoanData.customerPhone,
      amount: principal,
      interestRate: rate,
      tenure: tenure,
      monthlyEMI: Math.round(emi),
      status: 'active',
      disbursedDate: new Date().toISOString().split('T')[0],
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalPaid: 0,
      remainingAmount: principal,
      completedEMIs: 0,
      purpose: newLoanData.purpose
    }

    setLoans([...loans, newLoan])
    setNewLoanData({
      customerName: '',
      customerPhone: '',
      amount: '',
      interestRate: '12',
      tenure: '',
      purpose: ''
    })
    setIsAddLoanDialogOpen(false)
    alert('Loan added successfully!')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const calculateEMI = () => {
    const { principal, rate, tenure } = calculatorValues
    if (!principal || !rate || !tenure) return 0
    
    const P = parseFloat(principal)
    const R = parseFloat(rate) / 100 / 12
    const N = parseInt(tenure)
    
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)
    return Math.round(emi)
  }

  const sendWhatsAppReminder = (loan) => {
    // Mock WhatsApp integration
    alert(`WhatsApp reminder sent to ${loan.customerName} (${loan.customerPhone}) for EMI due on ${loan.nextDueDate}`)
  }

  const generateReceipt = (loan, emiNumber) => {
    // Mock receipt generation
    alert(`Receipt generated for ${loan.customerName} - EMI #${emiNumber}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">Manage loans, EMI schedules, and payments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isEMICalculatorOpen} onOpenChange={setIsEMICalculatorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Calculator className="mr-2 h-4 w-4" />
                EMI Calculator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>EMI Calculator</DialogTitle>
                <DialogDescription>
                  Calculate monthly EMI for loan amount
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">Loan Amount (₹)</Label>
                  <Input
                    id="principal"
                    type="number"
                    value={calculatorValues.principal}
                    onChange={(e) => setCalculatorValues({...calculatorValues, principal: e.target.value})}
                    placeholder="Enter loan amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Interest Rate (% per annum)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.1"
                    value={calculatorValues.rate}
                    onChange={(e) => setCalculatorValues({...calculatorValues, rate: e.target.value})}
                    placeholder="Enter interest rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenure">Tenure (months)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    value={calculatorValues.tenure}
                    onChange={(e) => setCalculatorValues({...calculatorValues, tenure: e.target.value})}
                    placeholder="Enter tenure in months"
                  />
                </div>
                {calculatorValues.principal && calculatorValues.rate && calculatorValues.tenure && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(calculateEMI())}
                      </div>
                      <div className="text-sm text-gray-600">Monthly EMI</div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Total Amount</div>
                        <div className="font-medium">{formatCurrency(calculateEMI() * parseInt(calculatorValues.tenure || 0))}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Total Interest</div>
                        <div className="font-medium">{formatCurrency((calculateEMI() * parseInt(calculatorValues.tenure || 0)) - parseFloat(calculatorValues.principal || 0))}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddLoanDialogOpen} onOpenChange={setIsAddLoanDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Loan</DialogTitle>
                <DialogDescription>
                  Create a new loan application for a customer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Select Customer *</Label>
                    <Select value={newLoanData.customerId} onValueChange={handleCustomerSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={String(customer.id)}>
                            {customer.fullName || customer.name} - {customer.phoneNumber || customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Customer Phone</Label>
                    <Input
                      id="customerPhone"
                      value={newLoanData.customerPhone}
                      onChange={(e) => setNewLoanData({...newLoanData, customerPhone: e.target.value})}
                      placeholder="Phone number"
                      disabled={!!newLoanData.customerName}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newLoanData.amount}
                      onChange={(e) => setNewLoanData({...newLoanData, amount: e.target.value})}
                      placeholder="Enter loan amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={newLoanData.interestRate}
                      onChange={(e) => setNewLoanData({...newLoanData, interestRate: e.target.value})}
                      placeholder="Interest rate"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure (months) *</Label>
                    <Input
                      id="tenure"
                      type="number"
                      value={newLoanData.tenure}
                      onChange={(e) => setNewLoanData({...newLoanData, tenure: e.target.value})}
                      placeholder="Loan tenure"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Loan Purpose *</Label>
                    <Select value={newLoanData.purpose} onValueChange={(value) => setNewLoanData({...newLoanData, purpose: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business Expansion">Business Expansion</SelectItem>
                        <SelectItem value="Home Renovation">Home Renovation</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Vehicle Purchase">Vehicle Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="processingFees">Processing Fees (₹)</Label>
                  <Input
                    id="processingFees"
                    type="number"
                    value={newLoanData.processingFees}
                    onChange={(e) => setNewLoanData({...newLoanData, processingFees: e.target.value})}
                    placeholder="Enter processing fees"
                  />
                </div>

                {/* Photo Upload Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo">Customer Photo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {newLoanData.photoUrl ? (
                        <div className="flex items-center space-x-4">
                          <img 
                            src={newLoanData.photoUrl} 
                            alt="Customer Photo" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-green-600">Photo uploaded successfully</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setNewLoanData({...newLoanData, photoUrl: ''})}
                              className="mt-1"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="mt-2">
                            <label htmlFor="photo-upload" className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-500">Upload customer photo</span>
                              <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) handlePhotoUpload(file, 'photo')
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                          {uploadingPhoto && (
                            <div className="flex items-center justify-center mt-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-sm">Uploading...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idCard">ID Card Photo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {newLoanData.idCardUrl ? (
                        <div className="flex items-center space-x-4">
                          <img 
                            src={newLoanData.idCardUrl} 
                            alt="ID Card" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-green-600">ID card uploaded successfully</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setNewLoanData({...newLoanData, idCardUrl: ''})}
                              className="mt-1"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Image className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="mt-2">
                            <label htmlFor="idcard-upload" className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-500">Upload ID card photo</span>
                              <input
                                id="idcard-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) handlePhotoUpload(file, 'idCard')
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                          {uploadingIdCard && (
                            <div className="flex items-center justify-center mt-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-sm">Uploading...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {newLoanData.amount && newLoanData.interestRate && newLoanData.tenure && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        Monthly EMI: {formatCurrency(
                          (() => {
                            const P = parseFloat(newLoanData.amount)
                            const R = parseFloat(newLoanData.interestRate) / 100 / 12
                            const N = parseInt(newLoanData.tenure)
                            return Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1))
                          })()
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Total Amount: {formatCurrency(
                          (() => {
                            const P = parseFloat(newLoanData.amount)
                            const R = parseFloat(newLoanData.interestRate) / 100 / 12
                            const N = parseInt(newLoanData.tenure)
                            const emi = Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1))
                            return emi * N
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddLoanDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLoan} disabled={addingLoan}>
                    {addingLoan ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Loan...
                      </>
                    ) : (
                      'Add Loan'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Loans</CardTitle>
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

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loans ({filteredLoans.length})</CardTitle>
          <CardDescription>
            Complete list of loans and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan Details</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount & EMI</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{loan.id}</div>
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
                      <div className="font-medium">{formatCurrency(loan.amount)}</div>
                      <div className="text-sm text-gray-500">EMI: {formatCurrency(loan.monthlyEMI)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Paid: {formatCurrency(loan.totalPaid)}</span>
                        <span>{loan.completedEMIs}/{loan.tenure}</span>
                      </div>
                      <Progress value={(loan.completedEMIs / loan.tenure) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>
                    {loan.nextDueDate ? (
                      <div className="text-sm">
                        <div>{new Date(loan.nextDueDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">{formatCurrency(loan.monthlyEMI)}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Completed</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={isViewDialogOpen && selectedLoan?.id === loan.id} onOpenChange={(open) => {
                        setIsViewDialogOpen(open)
                        if (!open) setSelectedLoan(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLoan(loan)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Loan Details - {selectedLoan?.id}</DialogTitle>
                            <DialogDescription>
                              Complete loan information and EMI schedule
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLoan && (
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="schedule">EMI Schedule</TabsTrigger>
                                <TabsTrigger value="payments">Payments</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium">Loan Information</Label>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Loan ID:</span>
                                          <span className="text-sm font-medium">{selectedLoan.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Amount:</span>
                                          <span className="text-sm font-medium">{formatCurrency(selectedLoan.amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Interest Rate:</span>
                                          <span className="text-sm">{selectedLoan.interestRate}% p.a.</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Tenure:</span>
                                          <span className="text-sm">{selectedLoan.tenure} months</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Monthly EMI:</span>
                                          <span className="text-sm font-medium">{formatCurrency(selectedLoan.monthlyEMI)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium">Customer Information</Label>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Name:</span>
                                          <span className="text-sm font-medium">{selectedLoan.customerName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Phone:</span>
                                          <span className="text-sm">{selectedLoan.customerPhone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Purpose:</span>
                                          <span className="text-sm">{selectedLoan.purpose}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm text-gray-500">Status:</span>
                                          {getStatusBadge(selectedLoan.status)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="flex items-center space-x-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        <div>
                                          <div className="text-sm text-gray-500">Total Paid</div>
                                          <div className="font-medium">{formatCurrency(selectedLoan.totalPaid)}</div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="flex items-center space-x-2">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                        <div>
                                          <div className="text-sm text-gray-500">Remaining</div>
                                          <div className="font-medium">{formatCurrency(selectedLoan.remainingAmount)}</div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="p-4">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5 text-purple-600" />
                                        <div>
                                          <div className="text-sm text-gray-500">EMIs Completed</div>
                                          <div className="font-medium">{selectedLoan.completedEMIs}/{selectedLoan.tenure}</div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="schedule">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">EMI Schedule</h3>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => downloadEMIScheduleCSV(selectedLoan)}
                                    >
                                      <Download className="mr-2 h-4 w-4" />
                                      Download Schedule
                                    </Button>
                                  </div>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>EMI #</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>EMI Amount</TableHead>
                                        <TableHead>Principal</TableHead>
                                        <TableHead>Interest</TableHead>
                                        <TableHead>Balance</TableHead>
                                        <TableHead>Status</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {generateEMISchedule(selectedLoan).map((emi) => (
                                        <TableRow key={emi.installmentNo}>
                                          <TableCell>{emi.installmentNo}</TableCell>
                                          <TableCell>{emi.dueDate}</TableCell>
                                          <TableCell>{formatCurrency(emi.emi)}</TableCell>
                                          <TableCell>{formatCurrency(emi.principal)}</TableCell>
                                          <TableCell>{formatCurrency(emi.interest)}</TableCell>
                                          <TableCell>{formatCurrency(emi.balance)}</TableCell>
                                          <TableCell>
                                            {emi.installmentNo <= (selectedLoan.completedEMIs || 0) ? (
                                              <Badge className="bg-green-100 text-green-800">Paid</Badge>
                                            ) : (
                                              <Badge variant="outline">Pending</Badge>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="payments">
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium">Payment History</h3>
                                  <div className="space-y-2">
                                    {generateEMISchedule(selectedLoan.amount, selectedLoan.interestRate, selectedLoan.tenure, selectedLoan.disbursedDate)
                                      .filter(emi => emi.paid)
                                      .map((emi) => (
                                        <div key={emi.emiNumber} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                          <div>
                                            <div className="font-medium">EMI #{emi.emiNumber}</div>
                                            <div className="text-sm text-gray-500">Paid on {new Date(emi.paidDate).toLocaleDateString()}</div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <span className="font-medium">{formatCurrency(emi.amount)}</span>
                                            <Button size="sm" variant="outline" onClick={() => generateReceipt(selectedLoan, emi.emiNumber)}>
                                              <Download className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                      {loan.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendWhatsAppReminder(loan)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadLoanDetailsPDF(loan)}
                        title="Download Loan Details"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

