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
  const [isWebsocketConnected, setIsWebsocketConnected] = useState(false)
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

  const isAuthenticated = Boolean(user)


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
    setIsWebsocketConnected(true)
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

  const handleLogout = async () => {
    try {
      await authService.logout()
      WebSocketManager.disconnect()
      sessionStorage.removeItem('auth')
      setUser(null)
      setAccessToken(null)
      setRefreshToken(null)
    } catch(error) {
      console.error('Logout Error:',error )
    }
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        refreshToken,
        laoding,
        login: handleLogin,
        logout: handleLogout,
        signup : handleSignup,
        handleLogout,
        isWebsocketConnected,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
