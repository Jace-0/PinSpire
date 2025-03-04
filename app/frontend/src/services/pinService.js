import api from './api'

export const pinService = {
  createPin : async (data) => {
    const response = await api.post('/pin', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  getAllPins : async (cursor) => {
    const response = await api.get(`/pin?cursor=${cursor}&limit=20`)
    return response.data
  },

  getPinById: async (pinId) => {
    const response = await api.get(`/pin/${pinId}`)
    return response.data
  },

  createComment : async (pinId, content) => {
    const response = await api.post(`/pin/${pinId}/comment`, content)
    return response.data
  },

  likePin : async (pinId) => {
    const response = await api.post(`/pin/${pinId}/like`)
    return response.data
  },

  likeComment : async (commentId) => {
    const response = await api.post(`/pin/comments/${commentId}/like`)
    return response.data
  },
  getUserPins : async (userId) => {
    const response = await api.get(`pin/user/${userId}`)
    return response.data.data
  },
  getLikedPins: async () => {
    const response = await api.get('pin/liked-pins/user')
    return response.data
  }
}



