// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { signup, login } from '../services/auth.service'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)

  // Persist auth state in session storage
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('auth')
    if (storedAuth) {
      const { user, accessToken, refreshToken } = JSON.parse(storedAuth)
      setUser(user)
      setAccessToken(accessToken)
      setRefreshToken(refreshToken)

    }
  }, [])


  const handleSignup = async (credentials) => {
    const response = await signup(credentials)
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
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await login(credentials)
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

      return response
    } catch (error) {
      throw error
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('auth')
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        login: handleLogin,
        logout: handleLogout,
        signup : handleSignup
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)