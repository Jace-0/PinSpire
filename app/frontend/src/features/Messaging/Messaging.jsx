import React, { useState, useEffect } from 'react'
import NewMessaging from './NewMessaging'
import { chatService } from '../../services/chatService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ChatSystem from './ChatSystem'
import { ChatContexts } from '../../context/ChatContext'
const Messaging = () => {
  const {
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
    setIsInitialized
  } = ChatContexts()

  const [Loading, setIsLoading] = useState(false)


  useEffect(() => {
    let isMounted = true

    const fetchChats = async () => {
      // Only fetch if not initialized and component is mounted
      if (!isMounted || isInitialized) return

      setIsLoading(true)
      try {
        const allChats = await chatService.getUserChats()
        if (isMounted) {
          setChats(allChats)
          setIsInitialized(true) // Mark as initialized after successful fetch
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching chats:', error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchChats()

    return () => {
      isMounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized])

  // LoadingSpinner not Visible FIX
  // if (Loading) return <LoadingSpinner/>

  const toggleNewMessage = () => {
    setIsMessageBodyOpen(prev => !prev)
    setIsNewMessageBodyOpen(prev => !prev)
  }

  const handleBackToMessages = () => {
    setIsMessageBodyOpen(prev => !prev)
    setIsNewMessageBodyOpen(prev => !prev)
  }

  const handleChatClick = (chatId) => {
    setSelectedChat(chatId)
    setIsMessageBodyOpen(prev => !prev)
    setOpenChat(prev => !prev)
  }


  const MessageBody = () => (
    <>
      <div className="messaging-header">
        <h3>Messages</h3>
        <div className="header-actions">
          <button className="new-message-btn" onClick={toggleNewMessage}>
            <i className="fa fa-plus"></i>
            <span>New message</span>
          </button>
        </div>
      </div>

      {/* Chats List */}
      {chats.length > 0 ? (
        <>
          <h3 className='not-empty'>Messages</h3>
          <div className="chats-container">
            <div className="chat-list">
              {chats.map((chat) => (
                <div key={chat.id}
                  className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
                  onClick={() => handleChatClick(chat.id)}>
                  <div className="chat-content">
                    <img
                      src={chat.otherUser.avatar_url}
                      alt="avatar"
                      className="chat-avatar" />
                    <div className="chat-details">
                      <span className="chat-username">{chat.otherUser.username}</span>
                      <span className="chat-last-message">{chat.lastMessage?.content || 'Empty chat'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>

      ) : (
        <div className="empty-state">
          <p className="empty-title">No messages yet</p>
        </div>
      )}
    </>
  )


  const NewMessageView = () => (
    <div className="new-message-container">
      <div className="messaging-header">
        <button
          className="back-button"
          onClick={handleBackToMessages}
        >
          <i className="fa fa-arrow-left"></i>
        </button>
        <h3>New Message</h3>
      </div>
      <NewMessaging onClose={toggleNewMessage} />
    </div>
  )

  return (
    <div className="messaging-system">
      <div className="messaging-panel">
        {isMessageBodyOpen ? (
          <MessageBody />
        ) : (
          <div className="messaging-content">
            {isNewMessageBodyOpen && <NewMessageView />}
          </div>
        )}
        {openChat && <ChatSystem/>}
      </div>
    </div>

  )
}

export default Messaging