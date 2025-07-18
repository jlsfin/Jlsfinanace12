import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock data
const stats = {
  totalCustomers: 1247,
  activeLoans: 892,
  totalDisbursed: 12450000,
  collectionRate: 94.5,
  pendingApplications: 23,
  overdueLoans: 45
}

const monthlyData = [
  { month: 'Jan', disbursed: 850000, collected: 780000 },
  { month: 'Feb', disbursed: 920000, collected: 850000 },
  { month: 'Mar', disbursed: 1100000, collected: 980000 },
  { month: 'Apr', disbursed: 980000, collected: 920000 },
  { month: 'May', disbursed: 1200000, collected: 1100000 },
  { month: 'Jun', disbursed: 1350000, collected: 1250000 }
]

const loanStatusData = [
  { name: 'Active', value: 65, color: '#22c55e' },
  { name: 'Completed', value: 25, color: '#3b82f6' },
  { name: 'Overdue', value: 8, color: '#ef4444' },
  { name: 'Pending', value: 2, color: '#f59e0b' }
]

const recentActivities = [
  { id: 1, type: 'loan_approved', customer: 'Rajesh Kumar', amount: 50000, time: '2 hours ago' },
  { id: 2, type: 'payment_received', customer: 'Priya Sharma', amount: 5500, time: '4 hours ago' },
  { id: 3, type: 'loan_disbursed', customer: 'Amit Singh', amount: 75000, time: '6 hours ago' },
  { id: 4, type: 'overdue_reminder', customer: 'Sunita Devi', amount: 3200, time: '8 hours ago' }
]

export default function Dashboard({ user }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'loan_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-blue-500" />
      case 'loan_disbursed':
        return <CreditCard className="h-4 w-4 text-purple-500" />
      case 'overdue_reminder':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'User'}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDisbursed)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collectionRate}%</div>
            <Progress value={stats.collectionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Monthly Performance</CardTitle>
            <CardDescription>Disbursement vs Collection</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="disbursed" fill="#3b82f6" name="Disbursed" />
                <Bar dataKey="collected" fill="#22c55e" name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Loan Status Distribution</CardTitle>
            <CardDescription>Current portfolio breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
              {loanStatusData.map((entry) => (
                <div key={entry.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs sm:text-sm">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.customer}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(activity.amount)} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Pending Applications</p>
                    <p className="text-xs text-gray-600">{stats.pendingApplications} applications awaiting review</p>
                  </div>
                </div>
                <Badge variant="secondary">{stats.pendingApplications}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Overdue Loans</p>
                    <p className="text-xs text-gray-600">{stats.overdueLoans} loans past due date</p>
                  </div>
                </div>
                <Badge variant="destructive">{stats.overdueLoans}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Collection Rate</p>
                    <p className="text-xs text-gray-600">Excellent performance this month</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">{stats.collectionRate}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

