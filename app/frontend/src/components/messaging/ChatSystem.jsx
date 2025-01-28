import { useEffect, useState, useRef } from 'react'
import { chatService } from '../../services/chatService'
import { useAuth } from '../../context/AuthContext'
import { ChatContexts } from '../../context/ChatContext'
import LoadingSpinner from '../common/LoadingSpinner'

const ChatSystem = () => {
  const { user: currentUser } = useAuth()

  // Chat context
  const {
    selectedChat,
    setOpenChat,
    openChat,
    setIsMessageBodyOpen,
    isMessageBodyOpen,
    sendMessage,
    messagesByChat,
    setMessagesByChat
  } = ChatContexts()

  // const [messagesByChat, setMessagesByChat] = useState([])
  const [LoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef(null)


  // Scroll to bottom whenever messages change or new chat is selected
  useEffect(() => {
    scrollToBottom()
  }, [messagesByChat])

  useEffect(() => {
    if (selectedChat) {
      const fetchChatMessages = async () => {
        setIsLoadingMessages(true)
        try {
          const chatMessages = await chatService.getChatMessages(selectedChat)
          setMessagesByChat(chatMessages)
          scrollToBottom()
        } catch (error) {
          console.error('Error fetching messages:', error)
        } finally{
          setIsLoadingMessages(false)
        }
      }
      fetchChatMessages()
    }
  }, [selectedChat, setMessagesByChat])

  if (LoadingMessages) return <LoadingSpinner/>

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBackToChats = () => {
    setOpenChat(!openChat)
    setIsMessageBodyOpen(!isMessageBodyOpen)
  }

  const ChatHeader = () => {
    // Find the other user in the chat (not current user)
    const otherUser = messagesByChat.find(msg => {
      return msg.sender_id !== currentUser.id
    })?.sender

    return (
      <div className="chat-header">
        <div className="chat-user-info">
          <button
            className="back-button"
            onClick={handleBackToChats}>
            <i className="fa fa-arrow-left"></i>
          </button>
          <img
            src={otherUser?.avatar_url}
            alt="User avatar"
            className="chat-avatar"
          />
          <span className="chat-username">{otherUser?.username}</span>
        </div>
      </div>
    )
  }

  const Messages = () => (
    <div className="messages-container">
      {messagesByChat.map((message) => (
        <div
          key={message.id}
          className={`message-wrapper ${
            message.sender_id === currentUser.id ? 'sent' : 'received'
          }`}
        >
          <div className="message-bubble">
            <p className="message-content">{message.content}</p>
            <span className="message-time">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )

  const Footer = () => {
    const [newMessage, setNewMessage] = useState('')

    const handleSendMessage = async (e) => {
      e.preventDefault()
      if (!newMessage.trim()) return

      try {
        await sendMessage(selectedChat, newMessage)
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }

    return (
      <form onSubmit={handleSendMessage} className="chat-footer">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button
          type="submit"
          className="send-button"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    )
  }

  return (
    <div className="chat-system">
      <ChatHeader />
      <Messages />
      <Footer />
    </div>
  )
}


export default ChatSystem