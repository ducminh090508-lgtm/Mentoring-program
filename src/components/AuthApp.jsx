import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'
import Dashboard from './Dashboard'
import TeacherDashboard from './TeacherDashboard'
import AdminDashboard from './AdminDashboard'

const AuthApp = () => {
  const { user, isLoading, login, signup } = useAuth()
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'

  const handleLogin = (userData) => login(userData)

  const handleSignup = (userData) => signup(userData)

  const switchToSignup = () => {
    setAuthMode('signup')
  }

  const switchToLogin = () => {
    setAuthMode('login')
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading...</p>
      </div>
    )
  }

  // If user is authenticated, show appropriate dashboard based on role
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard />
    }
    if (user.role === 'teacher') {
      return <TeacherDashboard />
    }
    return <Dashboard />
  }

  // Show login or signup page based on authMode
  return (
    <>
      {authMode === 'login' ? (
        <LoginPage 
          onLogin={handleLogin}
          onSwitchToSignup={switchToSignup}
        />
      ) : (
        <SignupPage 
          onSignup={handleSignup}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  )
}

export default AuthApp
