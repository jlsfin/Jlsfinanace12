import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  Eye, 
  Phone,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

// Mock customer loan data
const customerLoans = [
  {
    id: 'L001',
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
  }
]

// Mock EMI schedule
const emiSchedule = [
  { emiNumber: 1, dueDate: '2024-02-15', amount: 4441, status: 'paid', paidDate: '2024-02-14' },
  { emiNumber: 2, dueDate: '2024-03-15', amount: 4441, status: 'paid', paidDate: '2024-03-15' },
  { emiNumber: 3, dueDate: '2024-04-15', amount: 4441, status: 'paid', paidDate: '2024-04-13' },
  { emiNumber: 4, dueDate: '2024-05-15', amount: 4441, status: 'paid', paidDate: '2024-05-15' },
  { emiNumber: 5, dueDate: '2024-06-15', amount: 4441, status: 'paid', paidDate: '2024-06-14' },
  { emiNumber: 6, dueDate: '2024-07-15', amount: 4441, status: 'paid', paidDate: '2024-07-15' },
  { emiNumber: 7, dueDate: '2024-08-15', amount: 4441, status: 'paid', paidDate: '2024-08-14' },
  { emiNumber: 8, dueDate: '2024-09-15', amount: 4441, status: 'due', paidDate: null },
  { emiNumber: 9, dueDate: '2024-10-15', amount: 4441, status: 'upcoming', paidDate: null },
  { emiNumber: 10, dueDate: '2024-11-15', amount: 4441, status: 'upcoming', paidDate: null },
  { emiNumber: 11, dueDate: '2024-12-15', amount: 4441, status: 'upcoming', paidDate: null },
  { emiNumber: 12, dueDate: '2025-01-15', amount: 4441, status: 'upcoming', paidDate: null }
]

const recentTransactions = [
  { id: 1, date: '2024-08-14', type: 'EMI Payment', amount: 4441, status: 'completed' },
  { id: 2, date: '2024-07-15', type: 'EMI Payment', amount: 4441, status: 'completed' },
  { id: 3, date: '2024-06-14', type: 'EMI Payment', amount: 4441, status: 'completed' },
  { id: 4, date: '2024-05-15', type: 'EMI Payment', amount: 4441, status: 'completed' }
]

export default function CustomerDashboard({ user }) {
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'due':
        return <Badge className="bg-red-100 text-red-800">Due</Badge>
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'due':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'upcoming':
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const currentLoan = customerLoans[0] // For demo, using first loan

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-600">Manage your loans and track your payments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerLoans.length}</div>
            <p className="text-xs text-muted-foreground">
              Total loan amount: {formatCurrency(currentLoan.amount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next EMI</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentLoan.monthlyEMI)}</div>
            <p className="text-xs text-muted-foreground">
              Due: {new Date(currentLoan.nextDueDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentLoan.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {currentLoan.completedEMIs} of {currentLoan.tenure} EMIs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentLoan.remainingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {currentLoan.tenure - currentLoan.completedEMIs} EMIs left
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loan Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Progress</CardTitle>
          <CardDescription>Track your loan repayment progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Loan ID: {currentLoan.id}</span>
              <span className="text-sm text-gray-500">{currentLoan.purpose}</span>
            </div>
            <Progress value={(currentLoan.completedEMIs / currentLoan.tenure) * 100} className="h-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Paid: {formatCurrency(currentLoan.totalPaid)}</span>
              <span>{currentLoan.completedEMIs}/{currentLoan.tenure} EMIs</span>
              <span>Remaining: {formatCurrency(currentLoan.remainingAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EMI Schedule and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>EMI Schedule</CardTitle>
                <CardDescription>Upcoming and past EMI payments</CardDescription>
              </div>
              <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Complete EMI Schedule - {currentLoan.id}</DialogTitle>
                    <DialogDescription>
                      Full payment schedule for your loan
                    </DialogDescription>
                  </DialogHeader>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>EMI #</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emiSchedule.map((emi) => (
                        <TableRow key={emi.emiNumber}>
                          <TableCell className="font-medium">{emi.emiNumber}</TableCell>
                          <TableCell>{new Date(emi.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{formatCurrency(emi.amount)}</TableCell>
                          <TableCell>{getStatusBadge(emi.status)}</TableCell>
                          <TableCell>
                            {emi.paidDate ? new Date(emi.paidDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {emi.status === 'paid' && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emiSchedule.slice(0, 5).map((emi) => (
                <div key={emi.emiNumber} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(emi.status)}
                    <div>
                      <div className="font-medium">EMI #{emi.emiNumber}</div>
                      <div className="text-sm text-gray-500">
                        Due: {new Date(emi.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(emi.amount)}</div>
                    {getStatusBadge(emi.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">{transaction.type}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Contact our support team for assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Phone className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Customer Support</div>
                <div className="text-sm text-gray-500">+91 98765 43210</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Office Hours</div>
                <div className="text-sm text-gray-500">Mon-Fri: 9 AM - 6 PM</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-medium">Emergency</div>
                <div className="text-sm text-gray-500">24/7 WhatsApp Support</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

