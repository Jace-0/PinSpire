import api from './api'


export const chatService = {
  getUserChats : async () => {
    const response = await api.get('/chat/')
    return response.data
  },

  getChatMessages : async (chatId) => {
    const response = await api.get(`/chat/${chatId}/messages`)
    return response.data
  },

  sendMessage : async (selectedChat, newMessage) => {
    const data = {
      chat_id: selectedChat,
      content: newMessage
    }
    const response = await api.post('/chat/message', data )
    console.log('Response', response.data)
    return response.data
  },
  createNewChat : async (userId) => {
    const data = {
      otherUserId: userId
    }
    const response = await api.post('/chat/new', data)
    console.log('Response', response)
    return response.data
  }
}