import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Download, TrendingUp, TrendingDown, DollarSign, Users, CreditCard, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { format } from 'date-fns'

// Mock data for reports
const monthlyPerformance = [
  { month: 'Jan', disbursed: 850000, collected: 780000, customers: 45, loans: 38 },
  { month: 'Feb', disbursed: 920000, collected: 850000, customers: 52, loans: 44 },
  { month: 'Mar', disbursed: 1100000, collected: 980000, customers: 61, loans: 55 },
  { month: 'Apr', disbursed: 980000, collected: 920000, customers: 48, loans: 42 },
  { month: 'May', disbursed: 1200000, collected: 1100000, customers: 67, loans: 58 },
  { month: 'Jun', disbursed: 1350000, collected: 1250000, customers: 73, loans: 65 }
]

const collectionTrend = [
  { date: '2024-07-01', target: 100000, actual: 95000 },
  { date: '2024-07-02', target: 100000, actual: 102000 },
  { date: '2024-07-03', target: 100000, actual: 98000 },
  { date: '2024-07-04', target: 100000, actual: 105000 },
  { date: '2024-07-05', target: 100000, actual: 97000 },
  { date: '2024-07-06', target: 100000, actual: 110000 },
  { date: '2024-07-07', target: 100000, actual: 108000 }
]

const portfolioDistribution = [
  { category: 'Business Loans', value: 45, amount: 5400000, color: '#3b82f6' },
  { category: 'Personal Loans', value: 30, amount: 3600000, color: '#22c55e' },
  { category: 'Education Loans', value: 15, amount: 1800000, color: '#f59e0b' },
  { category: 'Home Loans', value: 10, amount: 1200000, color: '#ef4444' }
]

const riskAnalysis = [
  { risk: 'Low Risk', count: 450, percentage: 65, color: '#22c55e' },
  { risk: 'Medium Risk', count: 180, percentage: 26, color: '#f59e0b' },
  { risk: 'High Risk', count: 62, percentage: 9, color: '#ef4444' }
]

const overdueAnalysis = [
  { days: '1-30 days', count: 25, amount: 125000 },
  { days: '31-60 days', count: 12, amount: 84000 },
  { days: '61-90 days', count: 6, amount: 45000 },
  { days: '90+ days', count: 2, amount: 18000 }
]

export default function Reports({ user }) {
  const [dateRange, setDateRange] = useState({ from: new Date(2024, 0, 1), to: new Date() })
  const [reportType, setReportType] = useState('overview')

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalDisbursed = monthlyPerformance.reduce((sum, month) => sum + month.disbursed, 0)
  const totalCollected = monthlyPerformance.reduce((sum, month) => sum + month.collected, 0)
  const collectionRate = ((totalCollected / totalDisbursed) * 100).toFixed(1)

  const exportReport = () => {
    try {
      let reportData = []
      let fileName = ''
      
      switch (reportType) {
        case 'overview':
          reportData = monthlyPerformance
          fileName = 'Overview_Report'
          break
        case 'collection':
          reportData = collectionTrend
          fileName = 'Collection_Report'
          break
        case 'portfolio':
          reportData = portfolioDistribution
          fileName = 'Portfolio_Report'
          break
        case 'risk':
          reportData = riskAnalysis
          fileName = 'Risk_Assessment_Report'
          break
        default:
          reportData = monthlyPerformance
          fileName = 'Report'
      }

      // Create CSV content
      const headers = Object.keys(reportData[0] || {})
      const csvContent = [
        headers.join(','),
        ...reportData.map(row => 
          headers.map(header => {
            const value = row[header]
            return typeof value === 'string' ? `"${value}"` : value
          }).join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Failed to export report. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview Report</SelectItem>
              <SelectItem value="collection">Collection Report</SelectItem>
              <SelectItem value="portfolio">Portfolio Analysis</SelectItem>
              <SelectItem value="risk">Risk Assessment</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDisbursed)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCollected)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +8.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +2.1% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +15.2% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {reportType === 'overview' && (
        <>
          {/* Monthly Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trend</CardTitle>
              <CardDescription>Disbursement vs Collection over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="disbursed" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Disbursed" />
                  <Area type="monotone" dataKey="collected" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Collected" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer and Loan Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers acquired monthly</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={3} name="New Customers" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Disbursement</CardTitle>
                <CardDescription>Number of loans disbursed monthly</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="loans" fill="#22c55e" name="Loans Disbursed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {reportType === 'collection' && (
        <>
          {/* Collection Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Collection Performance</CardTitle>
              <CardDescription>Target vs Actual collection for the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={collectionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM dd')} />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" name="Target" />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Overdue Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Overdue Analysis</CardTitle>
              <CardDescription>Breakdown of overdue loans by aging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueAnalysis.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-medium">{item.days}</div>
                        <div className="text-sm text-gray-500">{item.count} loans</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.amount)}</div>
                      <Badge variant={index === 0 ? "secondary" : index === 1 ? "default" : "destructive"}>
                        {((item.amount / 272000) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {reportType === 'portfolio' && (
        <>
          {/* Portfolio Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>Loan portfolio by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {portfolioDistribution.map((entry) => (
                    <div key={entry.category} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="text-sm">
                        <div className="font-medium">{entry.category}</div>
                        <div className="text-gray-500">{formatCurrency(entry.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value</CardTitle>
                <CardDescription>Total value by loan category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={portfolioDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <YAxis type="category" dataKey="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {reportType === 'risk' && (
        <>
          {/* Risk Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Customer risk profile breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskAnalysis}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {riskAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {riskAnalysis.map((entry) => (
                    <div key={entry.risk} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium">{entry.risk}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{entry.count}</span>
                        <span className="text-gray-500 ml-1">({entry.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
                <CardDescription>Key risk indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Default Rate</span>
                      <span className="text-sm font-bold">2.3%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '2.3%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">NPL Ratio</span>
                      <span className="text-sm font-bold">4.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '4.1%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Recovery Rate</span>
                      <span className="text-sm font-bold">87.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">95.7%</div>
                        <div className="text-sm text-gray-500">Healthy Loans</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">4.3%</div>
                        <div className="text-sm text-gray-500">At Risk</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

