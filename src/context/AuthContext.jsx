import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthChanged, loginWithEmail, signupWithEmail, logoutUser, fetchUserProfile } from '../services/userService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid)
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || profile?.name, role: profile?.role || 'student' })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async ({ email, password }) => {
    const profile = await loginWithEmail(email, password)
    setUser(profile)
  }

  const signup = async (userData) => {
    const profile = await signupWithEmail(userData)
    setUser(profile)
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
  }

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('eduDashboard_user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
