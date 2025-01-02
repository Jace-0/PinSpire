// services/userService.js
import api  from './api'

export const userService = {
  // login: (credentials) => api.post('/auth/login', credentials),
  // logout: () => api.post('/auth/logout'),
  getProfile: (userId) => api.get(`/user/profile/id/${userId}`),
  getProfileByUsername: async (username) => {
    const response = await api.get(`/user/profile/username/${username}`)
    return response.data
  },
  updateProfile: async (userId, data) => {
    const response = await api.put(`/user/profile/settings/${userId}`, data)
    return response.data
  }
}

