import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock user data
const mockUsers = {
  'admin@mfi.com': { password: 'admin123', role: 'admin', name: 'Admin User', email: 'admin@mfi.com' },
  'manager@mfi.com': { password: 'manager123', role: 'manager', name: 'Manager User', email: 'manager@mfi.com' },
  '9876543212': { password: '3212', role: 'customer', name: 'John Doe', phone: '9876543212' }
}

export default function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const identifier = loginType === 'email' ? email : phone
      const user = mockUsers[identifier]
      
      if (!user || user.password !== password) {
        throw new Error('Invalid credentials')
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onLogin({
        uid: identifier,
        ...user
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">MFI Dashboard</CardTitle>
          <CardDescription>Microfinance Institution Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="loginType">Login Type</Label>
              <Select value={loginType} onValueChange={setLoginType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email (Admin/Manager)</SelectItem>
                  <SelectItem value="phone">Phone (Customer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loginType === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={loginType === 'phone' ? 'Last 4 digits of phone' : 'Enter your password'}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p><strong>Admin:</strong> admin@mfi.com / admin123</p>
              <p><strong>Manager:</strong> manager@mfi.com / manager123</p>
              <p><strong>Customer:</strong> 9876543212 / 3212</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

