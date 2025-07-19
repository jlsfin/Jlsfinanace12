import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import CustomerManagement from './components/CustomerManagement'
import LoanManagement from './components/LoanManagement'
import EMICollection from './components/EMICollection'
import Receipts from './components/Receipts'
import KYCRegistration from './components/KYCRegistration'
import LoanApplication from './components/LoanApplication'
import LoanApprovals from './components/LoanApprovals'
import LoanDisbursal from './components/LoanDisbursal'
import Reports from './components/Reports'
import Settings from './components/Settings'
import UserManagement from './components/UserManagement'
import CustomerDashboard from './components/CustomerDashboard'
import Layout from './components/Layout'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('mfi_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('mfi_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mfi_user')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'customer' ? '/customer-dashboard' : '/dashboard'} replace />
            ) : (
              <LoginPage onLogin={login} />
            )
          } 
        />
        
        {user ? (
          user.role === 'customer' ? (
            <Route 
              path="/customer-dashboard" 
              element={
                <Layout user={user} onLogout={logout}>
                  <CustomerDashboard user={user} />
                </Layout>
              } 
            />
          ) : (
            <>
              <Route 
                path="/dashboard" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <Dashboard user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/customers" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <CustomerManagement user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/loans" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <LoanManagement user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/emi-collection" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <EMICollection user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/receipts" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <Receipts user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/kyc-registration" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <KYCRegistration user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/kyc-registration/:customerId" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <KYCRegistration user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/loan-application" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <LoanApplication user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/loan-application/:customerId" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <LoanApplication user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/loan-approvals" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <LoanApprovals user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/loan-approvals/:applicationId" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <LoanApprovals user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/loan-disbursal" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <LoanDisbursal user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/loan-disbursal/:applicationId" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <LoanDisbursal user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <Reports user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <Settings user={user} />
                  </Layout>
                } 
              />
              <Route 
                path="/user-management" 
                element={
                  <Layout user={user} onLogout={logout}>
                    <UserManagement user={user} />
                  </Layout>
                } 
              />
            </>
          )
        ) : null}
        
        <Route 
          path="*" 
          element={
            <Navigate to={user ? (user.role === 'customer' ? '/customer-dashboard' : '/dashboard') : '/login'} replace />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App


