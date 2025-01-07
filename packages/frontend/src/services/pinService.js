import api from './api'

export const pinService = {
  createPin : async (data) => {
    const response = await api.post('/pin', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    console.log('Response Data', response.data)
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

  addComment : async (pinId, content) => {
    const response = await api.post(`/pin/${pinId}/comment`, content)
    console.log(response.data)
    return response.data
  },

  likePin : async (pinId) => {
    const response = await api.post(`/pin/${pinId}/like`)
    console.log(response.data)
    return response.data
  }

}



