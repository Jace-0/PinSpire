import { createContext, useContext, useState, useRef , useEffect, useCallback  } from 'react'
import WebSocketManager from '../utils/websocketManager'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const { isConnected } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)

  // toggle UI
  const [isMessageBodyOpen, setIsMessageBodyOpen] = useState(true)
  const [isNewMessageBodyOpen, setIsNewMessageBodyOpen] = useState(false)
  const [openChat, setOpenChat] = useState(false)

  // Chats
  const [chats, setChats] = useState([])

  // Chat Messages
  const [messagesByChat, setMessagesByChat] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)


  const handleChatMessage = useCallback((message) => {
    const { id, chat_id, content, sender_id, created_at, status, updated_at } = message.data

    console.log('Message Sent', message)

    if (message && message.data) {
      setMessagesByChat(prevMessages => {
        // Ensure we're not adding undefined or malformed messages
        if (!message.data.id || !message.data.chat_id) {
          console.warn('Received message without required fields:', message)
          return prevMessages
        }

        // Check if message already exists to prevent duplicates
        const messageExists = prevMessages.some(msg => msg.id === message.data.id)
        if (messageExists) {
          return prevMessages
        }

        return [...prevMessages, message.data]
      })
    }
    const lastMessage = {
      chat_id,
      content,
      id,
      sender_id,
      created_at,
      status,
      updated_at

    }


    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat.id === chat_id) {
          console.log('THIS CHAT', chat)
          return {
            ...chat,
            lastMessage
          }
        }
        return chat
      })
      return updatedChats.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )
    })
  }, [])

  console.log('MESSAGRDDDDD', messagesByChat)

  console.log('Chat', chats)


  // Send message helper
  const sendMessage = useCallback(async (chatId, content) => {
    console.log('CHatId', chatId)
    console.log('content', content)

    try {
      const ws = WebSocketManager.getInstance()
      console.log('WS', ws)
      if (!ws) throw new Error('WebSocket not connected')

      await ws.sendMessage('send_message', {
        chat_id: chatId,
        content
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }, [])


  // Wait for WebSocket connection before subscribing
  useEffect(() => {
    let subscribed = false

    const initializeChat = () => {
      // Check if WebSocket is initialized
      const ws = WebSocketManager.getInstance()

      if (ws && isConnected && !subscribed) {

        WebSocketManager.subscribe('message_sent', handleChatMessage)
        subscribed = true
        // WebSocketManager.startMonitoringHandlers()
      } else {
        // If not connected, retry after a short delay
        setTimeout(initializeChat, 100)
      }
    }

    if (isConnected) {
      initializeChat()
    }

    return () => {
      subscribed = false
    }
  }, [isConnected, handleChatMessage])


  const value = {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    isMessageBodyOpen,
    setIsMessageBodyOpen,
    isNewMessageBodyOpen,
    setIsNewMessageBodyOpen,
    openChat,
    setOpenChat,
    isInitialized,
    setIsInitialized,
    sendMessage,
    messagesByChat,
    setMessagesByChat
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>

}

export const ChatContexts = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('ChatContexts must be used within the UserProvider')
  }
  return context
}