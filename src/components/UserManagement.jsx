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
import { Search, Plus, User, Shield, Edit, Trash2, Eye, EyeOff, UserCheck, UserX, Settings } from 'lucide-react'

export default function UserManagement({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Agent',
    department: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
    permissions: {
      customers: { view: true, create: false, edit: false, delete: false },
      loans: { view: true, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    },
    notes: ''
  })

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Mock users data - in real app, this would come from API
      const mockUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@mfi.com',
          phone: '9876543200',
          role: 'Admin',
          department: 'Management',
          status: 'Active',
          lastLogin: '2024-07-18T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          permissions: {
            customers: { view: true, create: true, edit: true, delete: true },
            loans: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, create: true, edit: true, delete: true },
            settings: { view: true, create: true, edit: true, delete: true }
          }
        },
        {
          id: 2,
          name: 'Manager User',
          email: 'manager@mfi.com',
          phone: '9876543201',
          role: 'Manager',
          department: 'Operations',
          status: 'Active',
          lastLogin: '2024-07-18T09:15:00Z',
          createdAt: '2024-02-15T00:00:00Z',
          permissions: {
            customers: { view: true, create: true, edit: true, delete: false },
            loans: { view: true, create: true, edit: true, delete: false },
            reports: { view: true, create: true, edit: false, delete: false },
            settings: { view: true, create: false, edit: false, delete: false }
          }
        },
        {
          id: 3,
          name: 'Agent Smith',
          email: 'agent1@mfi.com',
          phone: '9876543202',
          role: 'Agent',
          department: 'Field Operations',
          status: 'Active',
          lastLogin: '2024-07-17T16:45:00Z',
          createdAt: '2024-03-10T00:00:00Z',
          permissions: {
            customers: { view: true, create: true, edit: true, delete: false },
            loans: { view: true, create: true, edit: false, delete: false },
            reports: { view: true, create: false, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false }
          }
        },
        {
          id: 4,
          name: 'Support User',
          email: 'support@mfi.com',
          phone: '9876543203',
          role: 'Support',
          department: 'Customer Service',
          status: 'Inactive',
          lastLogin: '2024-07-10T14:20:00Z',
          createdAt: '2024-04-20T00:00:00Z',
          permissions: {
            customers: { view: true, create: false, edit: true, delete: false },
            loans: { view: true, create: false, edit: false, delete: false },
            reports: { view: false, create: false, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false }
          }
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-red-100 text-red-800',
      'Suspended': 'bg-yellow-100 text-yellow-800'
    }
    const icons = {
      'Active': UserCheck,
      'Inactive': UserX,
      'Suspended': Shield
    }
    const Icon = icons[status] || UserCheck
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const getRoleBadge = (role) => {
    const colors = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Manager': 'bg-blue-100 text-blue-800',
      'Agent': 'bg-green-100 text-green-800',
      'Support': 'bg-orange-100 text-orange-800'
    }
    return <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>
  }

  const openUserDialog = (userToEdit = null) => {
    if (userToEdit) {
      setIsEditMode(true)
      setSelectedUser(userToEdit)
      setUserData({
        name: userToEdit.name,
        email: userToEdit.email,
        phone: userToEdit.phone,
        role: userToEdit.role,
        department: userToEdit.department || '',
        password: '',
        confirmPassword: '',
        status: userToEdit.status,
        permissions: userToEdit.permissions || {
          customers: { view: true, create: false, edit: false, delete: false },
          loans: { view: true, create: false, edit: false, delete: false },
          reports: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false }
        },
        notes: userToEdit.notes || ''
      })
    } else {
      setIsEditMode(false)
      setSelectedUser(null)
      setUserData({
        name: '',
        email: '',
        phone: '',
        role: 'Agent',
        department: '',
        password: '',
        confirmPassword: '',
        status: 'Active',
        permissions: {
          customers: { view: true, create: false, edit: false, delete: false },
          loans: { view: true, create: false, edit: false, delete: false },
          reports: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false }
        },
        notes: ''
      })
    }
    setIsUserDialogOpen(true)
  }

  const handleUserSubmit = async () => {
    if (!userData.name || !userData.email || !userData.phone || !userData.role) {
      alert('Please fill all required fields')
      return
    }

    if (!isEditMode && (!userData.password || userData.password !== userData.confirmPassword)) {
      alert('Password is required and must match confirmation')
      return
    }

    if (isEditMode && userData.password && userData.password !== userData.confirmPassword) {
      alert('Password and confirmation must match')
      return
    }

    try {
      setSubmitting(true)
      
      if (isEditMode) {
        // Update existing user
        const updatedUser = {
          ...selectedUser,
          ...userData,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.email || 'admin@mfi.com'
        }
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u))
        alert('User updated successfully!')
      } else {
        // Create new user
        const newUser = {
          id: Date.now(),
          ...userData,
          createdAt: new Date().toISOString(),
          createdBy: user?.email || 'admin@mfi.com',
          lastLogin: null
        }
        setUsers([newUser, ...users])
        alert('User created successfully!')
      }

      setIsUserDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Failed to save user. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.role === 'Admin') {
      alert('Cannot delete admin users')
      return
    }

    if (confirm(`Are you sure you want to delete user "${userToDelete.name}"?`)) {
      try {
        setUsers(users.filter(u => u.id !== userToDelete.id))
        alert('User deleted successfully!')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user. Please try again.')
      }
    }
  }

  const toggleUserStatus = async (userToToggle) => {
    try {
      const newStatus = userToToggle.status === 'Active' ? 'Inactive' : 'Active'
      const updatedUser = {
        ...userToToggle,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'admin@mfi.com'
      }
      setUsers(users.map(u => u.id === userToToggle.id ? updatedUser : u))
      alert(`User ${newStatus.toLowerCase()} successfully!`)
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status. Please try again.')
    }
  }

  const updatePermission = (module, action, value) => {
    setUserData({
      ...userData,
      permissions: {
        ...userData.permissions,
        [module]: {
          ...userData.permissions[module],
          [action]: value
        }
      }
    })
  }

  const setRolePermissions = (role) => {
    let permissions = {
      customers: { view: true, create: false, edit: false, delete: false },
      loans: { view: true, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }

    switch (role) {
      case 'Admin':
        permissions = {
          customers: { view: true, create: true, edit: true, delete: true },
          loans: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, create: true, edit: true, delete: true }
        }
        break
      case 'Manager':
        permissions = {
          customers: { view: true, create: true, edit: true, delete: false },
          loans: { view: true, create: true, edit: true, delete: false },
          reports: { view: true, create: true, edit: false, delete: false },
          settings: { view: true, create: false, edit: false, delete: false }
        }
        break
      case 'Agent':
        permissions = {
          customers: { view: true, create: true, edit: true, delete: false },
          loans: { view: true, create: true, edit: false, delete: false },
          reports: { view: true, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false }
        }
        break
      case 'Support':
        permissions = {
          customers: { view: true, create: false, edit: true, delete: false },
          loans: { view: true, create: false, edit: false, delete: false },
          reports: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false }
        }
        break
    }

    setUserData({ ...userData, role, permissions })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openUserDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Total Users</div>
                <div className="font-medium">{users.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-500">Active Users</div>
                <div className="font-medium">
                  {users.filter(u => u.status === 'Active').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-500">Admins</div>
                <div className="font-medium">
                  {users.filter(u => u.role === 'Admin').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm text-gray-500">Agents</div>
                <div className="font-medium">
                  {users.filter(u => u.role === 'Agent').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage all system users and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role & Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getRoleBadge(user.role)}
                        <div className="text-sm text-gray-500">{user.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.lastLogin ? 
                          new Date(user.lastLogin).toLocaleDateString() : 
                          'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUserDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.status === 'Active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        {user.role !== 'Admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Dialog */}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update user information and permissions' : 'Create a new system user'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={userData.department}
                  onChange={(e) => setUserData({...userData, department: e.target.value})}
                  placeholder="Enter department"
                />
              </div>
            </div>
          </div>

          {/* Role and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Role and Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={userData.role} onValueChange={(value) => setRolePermissions(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={userData.status} onValueChange={(value) => setUserData({...userData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {isEditMode ? 'Change Password (Optional)' : 'Password *'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={userData.password}
                    onChange={(e) => setUserData({...userData, password: e.target.value})}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={userData.confirmPassword}
                  onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions</h3>
            <div className="space-y-4">
              {Object.entries(userData.permissions).map(([module, perms]) => (
                <div key={module} className="border rounded-lg p-4">
                  <h4 className="font-medium capitalize mb-3">{module}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(perms).map(([action, value]) => (
                      <div key={action} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${module}-${action}`}
                          checked={value}
                          onChange={(e) => updatePermission(module, action, e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`${module}-${action}`} className="capitalize text-sm">
                          {action}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={userData.notes}
              onChange={(e) => setUserData({...userData, notes: e.target.value})}
              placeholder="Enter any additional notes about the user"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUserSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </div>
  )
}

