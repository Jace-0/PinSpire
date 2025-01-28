// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import WebSocketManager from '../utils/websocketManager'
import { authService } from '../services/auth.service'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [laoding, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  // Persist auth state in session storage
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('auth')
    if (storedAuth) {
      const { user, accessToken, refreshToken } = JSON.parse(storedAuth)
      setUser(user)
      setAccessToken(accessToken)
      setRefreshToken(refreshToken)

    }
    setLoading(false)
  }, [])


  // Websocket Connection Management
  useEffect(() => {
    if (accessToken) {
      try {
        WebSocketManager.initialize(accessToken)
      } catch (error) {
        console.error('WebSocket connection failed:', error)
      }
    } else {
      WebSocketManager.disconnect()
    }
    setIsConnected(true)
  }, [accessToken])


  const handleSignup = async (credentials) => {
    const response = await authService.signup(credentials)
    const { user, accessToken, refreshToken } = response

    sessionStorage.setItem('auth', JSON.stringify({
      user,
      accessToken,
      refreshToken
    }))

    setUser(user)
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)

  }


  const handleLogin = async (credentials) => {
    const response = await authService.login(credentials)
    console.log('Response', response)
    const { user, accessToken, refreshToken } = response

    // Store in session storage (more secure than localStorage)
    sessionStorage.setItem('auth', JSON.stringify({
      user,
      accessToken,
      refreshToken
    }))

    setUser(user)
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)

  }

  // useEffect(() => {
  //   if (!user && !accessToken) {
  //     sessionStorage.removeItem('auth')
  //   }
  // }, [user, accessToken])

  const handleLogout = () => {
    WebSocketManager.disconnect()
    sessionStorage.removeItem('auth')
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        refreshToken,
        laoding,
        isAuthenticated: !!accessToken,
        login: handleLogin,
        logout: handleLogout,
        signup : handleSignup,
        handleLogout,
        isConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)