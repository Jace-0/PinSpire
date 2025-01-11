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
  },
  updateAvatar: async (userId, formData) => {
    try {
      console.log('FormData',formData)
      const response = await api.put(
        `/user/profile/settings/${userId}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update avatar')
    }
  },

  followUser : async (profileId) => {
    console.log('PPPP', profileId)
    const response = await api.post(`/user/${profileId}/followers`)
    return response.data
  },

  checkFollowStatus: async (profileId) => {
    const response = await api.get(`/user/followers/check/${profileId}`)
    return response.data
  }
}

