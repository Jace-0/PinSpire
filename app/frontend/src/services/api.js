import axios from 'axios'
import { authService } from './auth.service'

const BASE_URL = 'http://localhost:3000/api'


// Main API instance for authenticated routes
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Auth API instance (uses same base URL)
export const authApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const auth = sessionStorage.getItem('auth')
  if (auth) {
    const { accessToken } = JSON.parse(auth)
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})



api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Check both 401 status and error type for token expiration
    const isTokenExpired =
        error.response?.status === 401 &&
        (error.response?.data?.type === 'AUTH_ERROR' ||
         error.response?.data?.error === 'Token expired')

    if (isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const auth = JSON.parse(sessionStorage.getItem('auth'))
        if (!auth?.refreshToken) {
          throw new Error('No refresh token available')
        }

        // Call refresh token endpoint with current refresh token
        const response = await authService.refreshToken(auth.refreshToken)

        // Get new tokens
        const { accessToken, refreshToken } = response

        // Update storage with new tokens
        const newAuth = {
          ...auth,
          accessToken,
          refreshToken
        }

        sessionStorage.setItem('auth', JSON.stringify(newAuth))
        // window.refreshAuthState() // This will trigger the useEffect
        // // Improve later
        window.location.reload()
        // Help reset connection, Websocket expecially

        // sessionStorage.setItem('auth', JSON.stringify(newAuth))
        // Update request header with new access token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, logout
        // sessionStorage.removeItem('auth')
        // window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)


export default api