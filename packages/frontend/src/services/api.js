import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
})

api.interceptors.request.use((config) => {
  const auth = sessionStorage.getItem('auth')
  if (auth) {
    const { token } = JSON.parse(auth)
    config.headers.Authorization = `Bearer ${token}`
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
          `${process.env.REACT_APP_API_URL}/refresh-token`,
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