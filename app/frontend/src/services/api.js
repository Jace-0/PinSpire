import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

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
    // console.log('Token', accessToken)
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})



api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const auth = JSON.parse(sessionStorage.getItem('auth'))

        // Call refresh token endpoint with current refresh token
        const response = await axios.post(
          `${authApi}/auth/refresh-token`,
          { refreshToken: auth.refreshToken }
        )

        // Get new tokens
        const { accessToken, refreshToken } = response.data

        // Update storage with new tokens
        const newAuth = {
          ...auth,
          accessToken,
          refreshToken
        }
        sessionStorage.setItem('auth', JSON.stringify(newAuth))

        // Update request header with new access token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, logout
        sessionStorage.removeItem('auth')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api