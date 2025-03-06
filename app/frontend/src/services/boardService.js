import api from './api'

export const boardService = {
  createBoard : async (name) => {
    const response = await api.post('/board/new', { name })
    return response.data
  },

  getUserBoards : async () => {
    const response = await api.get('/board')
    return response.data
  },

  getBoardPins : async (boardId) => {
    const response = await api.get(`/board/${boardId}`)
    return response.data
  },

  getBoardPinsByUsernameAndName: async ({ username, boardName }) => {
    const response = await api.get(`/board/${username}/${boardName}`)
    return response.data
  },

  addPinToBoard: async ({ boardId, pinId }) => {
    const response = await api.post('/board/add', { boardId, pinId })
    return response.data
  }
}