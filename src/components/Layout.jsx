import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Home, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Menu, 
  LogOut,
  Building2,
  DollarSign,
  Receipt,
  FileText,
  UserCheck,
  CheckCircle,
  Banknote,
  UserCog
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'manager', 'agent'] },
  { name: 'Customers', href: '/customers', icon: Users, roles: ['admin', 'manager', 'agent'] },
  { name: 'All Loans', href: '/loans', icon: CreditCard, roles: ['admin', 'manager', 'agent'] },
  { name: 'EMI Collection', href: '/emi-collection', icon: DollarSign, roles: ['admin', 'manager', 'agent'] },
  { name: 'Receipts', href: '/receipts', icon: Receipt, roles: ['admin', 'manager', 'agent'] },
  { name: 'KYC Registration', href: '/kyc-registration', icon: UserCheck, roles: ['admin', 'manager', 'agent'] },
  { name: 'Loan Application', href: '/loan-application', icon: FileText, roles: ['admin', 'manager', 'agent'] },
  { name: 'Loan Approvals', href: '/loan-approvals', icon: CheckCircle, roles: ['admin', 'manager'] },
  { name: 'Loan Disbursal', href: '/loan-disbursal', icon: Banknote, roles: ['admin', 'manager'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { name: 'User Management', href: '/user-management', icon: UserCog, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'manager'] },
]

export default function Layout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  )

  const handleNavigation = (href) => {
    navigate(href)
    setSidebarOpen(false)
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-64' : 'w-64'} bg-white border-r border-gray-200`}>
      <div className="flex items-center h-16 px-6 bg-blue-600">
        <Building2 className="h-8 w-8 text-white mr-3" />
        <h1 className="text-white font-bold text-lg">JLS Finance</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
              {item.name}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

