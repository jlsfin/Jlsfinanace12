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
  Building2
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'manager'] },
  { name: 'Customers', href: '/customers', icon: Users, roles: ['admin', 'manager'] },
  { name: 'Loans', href: '/loans', icon: CreditCard, roles: ['admin', 'manager'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin'] },
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
        <h1 className="text-white font-bold text-lg">MFI Dashboard</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold text-gray-900">MFI Dashboard</span>
            </div>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

