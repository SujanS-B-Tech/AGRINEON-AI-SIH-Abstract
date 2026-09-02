import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('agroneon_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await api.get('/auth/me')
      // Map preferred_language correctly
      const userData = { ...res.data, language: res.data.preferred_language }
      setUser(userData)
      setIsAuthenticated(true)
    } catch (err) {
      console.error('Session expired or invalid', err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials)
      const { access_token, user: userData } = res.data
      localStorage.setItem('agroneon_token', access_token)
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      console.error(err)
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Login failed. Check your credentials.' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData)
      const { access_token, user: newUserData } = res.data
      localStorage.setItem('agroneon_token', access_token)
      setUser(newUserData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      console.error(err)
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Registration failed.' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('agroneon_token')
    
    // Do not clear offline cache automatically on logout just in case they want it later,
    // but we remove session data.
    localStorage.removeItem('agroneon_farm')
    localStorage.removeItem('agroneon_soil')
    
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (updates) => {
    setUser({ ...user, ...updates })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
