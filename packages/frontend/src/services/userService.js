// services/userService.js
import api  from './api'

export const userService = {
  // login: (credentials) => api.post('/auth/login', credentials),
  // logout: () => api.post('/auth/logout'),
  getProfile: (userId) => api.get(`/user/profile/${userId}`)
}

