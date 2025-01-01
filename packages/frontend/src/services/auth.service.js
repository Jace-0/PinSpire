// services/auth.service.js
import api, { authApi } from './api'
import { handleApiError } from '../utils/errorHandler'


export const authService = {
  login: async (credentials) => {
    try{
      const response = await authApi.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  signup: async (userData) => {
    try {
      const response = await authApi.post('/auth/signup', userData)
      return response.data
    }catch (error) {
      throw handleApiError(error)
    }
  },

  logout: async () => {
    try{
      await api.post('/auth/logout')
    }catch ( error ) {
      throw handleApiError(error)
    }
  },

  refreshToken:  async (token) => {
    try {
      const response = await authApi.post('/auth/refresh-token', { refreshToken: token })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

export default authService

