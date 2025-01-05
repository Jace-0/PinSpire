import api from './api'

export const pinService = {
  createPin : async (data) => {
    console.log('PIN Data', data)
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
  }
}



