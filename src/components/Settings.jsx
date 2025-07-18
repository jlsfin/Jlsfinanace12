import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  MessageSquare, 
  DollarSign,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

export default function Settings({ user }) {
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    // Profile settings
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Notification settings
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: true,
    overdueReminders: true,
    paymentConfirmations: true,
    
    // System settings
    defaultInterestRate: '12',
    maxLoanAmount: '500000',
    minCreditScore: '650',
    autoApprovalLimit: '25000',
    
    // WhatsApp settings
    whatsappApiKey: '',
    whatsappNumber: '',
    reminderTemplate: 'नमस्ते {name}, आपकी EMI ₹{amount} का भुगतान कल {date} को देय है। कृपया समय पर भुगतान करें।',
    confirmationTemplate: 'नमस्ते {name}, आपकी EMI ₹{amount} का भुगतान प्राप्त हो गया है। धन्यवाद!'
  })

  const handleSave = (section) => {
    // Mock save functionality
    alert(`${section} settings saved successfully!`)
  }

  const handlePasswordChange = () => {
    if (settings.newPassword !== settings.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    if (settings.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }
    alert('Password changed successfully!')
    setSettings({
      ...settings,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <SettingsIcon className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                    <span className="text-sm text-gray-500">Contact admin to change role</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={settings.currentPassword}
                        onChange={(e) => setSettings({...settings, currentPassword: e.target.value})}
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
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={settings.newPassword}
                      onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={settings.confirmPassword}
                      onChange={(e) => setSettings({...settings, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handlePasswordChange} className="mt-4">
                  Change Password
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave('Profile')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via WhatsApp</p>
                  </div>
                  <Switch
                    checked={settings.whatsappNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, whatsappNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Overdue Reminders</Label>
                    <p className="text-sm text-gray-500">Send automatic reminders for overdue payments</p>
                  </div>
                  <Switch
                    checked={settings.overdueReminders}
                    onCheckedChange={(checked) => setSettings({...settings, overdueReminders: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Confirmations</Label>
                    <p className="text-sm text-gray-500">Send confirmations when payments are received</p>
                  </div>
                  <Switch
                    checked={settings.paymentConfirmations}
                    onCheckedChange={(checked) => setSettings({...settings, paymentConfirmations: checked})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave('Notification')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure default system settings and loan parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultInterestRate">Default Interest Rate (%)</Label>
                  <Input
                    id="defaultInterestRate"
                    type="number"
                    step="0.1"
                    value={settings.defaultInterestRate}
                    onChange={(e) => setSettings({...settings, defaultInterestRate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxLoanAmount">Maximum Loan Amount (₹)</Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    value={settings.maxLoanAmount}
                    onChange={(e) => setSettings({...settings, maxLoanAmount: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minCreditScore">Minimum Credit Score</Label>
                  <Input
                    id="minCreditScore"
                    type="number"
                    value={settings.minCreditScore}
                    onChange={(e) => setSettings({...settings, minCreditScore: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autoApprovalLimit">Auto Approval Limit (₹)</Label>
                  <Input
                    id="autoApprovalLimit"
                    type="number"
                    value={settings.autoApprovalLimit}
                    onChange={(e) => setSettings({...settings, autoApprovalLimit: e.target.value})}
                  />
                </div>
              </div>
              
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Changes to system settings will affect new loan applications. Existing loans will not be modified.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave('System')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Integration</CardTitle>
              <CardDescription>
                Configure WhatsApp Business API for customer communication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsappApiKey">WhatsApp API Key</Label>
                  <Input
                    id="whatsappApiKey"
                    type="password"
                    value={settings.whatsappApiKey}
                    onChange={(e) => setSettings({...settings, whatsappApiKey: e.target.value})}
                    placeholder="Enter your WhatsApp Business API key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Business Number</Label>
                  <Input
                    id="whatsappNumber"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                    placeholder="Enter your WhatsApp business number"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderTemplate">EMI Reminder Template (Hindi)</Label>
                  <Textarea
                    id="reminderTemplate"
                    value={settings.reminderTemplate}
                    onChange={(e) => setSettings({...settings, reminderTemplate: e.target.value})}
                    rows={3}
                    placeholder="Enter reminder message template"
                  />
                  <p className="text-sm text-gray-500">
                    Available variables: {'{name}'}, {'{amount}'}, {'{date}'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmationTemplate">Payment Confirmation Template (Hindi)</Label>
                  <Textarea
                    id="confirmationTemplate"
                    value={settings.confirmationTemplate}
                    onChange={(e) => setSettings({...settings, confirmationTemplate: e.target.value})}
                    rows={3}
                    placeholder="Enter confirmation message template"
                  />
                  <p className="text-sm text-gray-500">
                    Available variables: {'{name}'}, {'{amount}'}
                  </p>
                </div>
              </div>
              
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  WhatsApp Business API requires approval from Meta. Ensure you have proper permissions before configuring.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Test Connection</Button>
                <Button onClick={() => handleSave('WhatsApp')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage security preferences and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Export</Label>
                    <p className="text-sm text-gray-500">Download your account data</p>
                  </div>
                  <Button variant="outline">Request Export</Button>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  For security reasons, some changes may require admin approval or additional verification.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave('Security')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

