import React, { useEffect, useState, useRef, useCallback } from 'react'
import WebSocketClient from '../../utils/WebSocketClient'

const NotificationSystem = ({ token }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const wsClient = useRef(null)


  useEffect(() => {
    // Initialize WebSocket client
    wsClient.current = new WebSocketClient('ws://localhost:3000/', token)

    // Connect to WebSocket server
    wsClient.current.connect()

    // notification handler
    wsClient.current.on('notification', (message) => {
      handleNewNotification(message.data)
    })

    // Cleanup on component unmount
    return () => {
      wsClient.current?.close()
    }
  }, [token ])


  const handleNewNotification = (notification) => {
    console.log('Notification', notification)
    const formattedNotification = formatNotification(notification)

    console.log('FomattedMessage', formattedNotification)

    setNotifications(prev => [formattedNotification, ...prev])
    if (!isOpen) {
      setUnreadCount(prev => prev + 1)
    }
  }

  const formatNotification = (notification) => {
    let message = ''
    switch (notification.data.type) {
    case 'Like':
      message = `${notification.data.content.username} liked your pin "${notification.data.content.pinTitle}"`
      break
    case 'Comment':
      message = `${notification.data.content.username} commented on your pin: "${notification.data.content.comment}"`
      break
    case 'Follow':
      message = `${notification.data.content.username} started following you`
      break
    case 'ReplyComment':
      message = `${notification.data.content.username} replied to your comment: "${notification.data.content.CommentReply}"`
      break
    case 'LikeComment':
      message = `${notification.data.content.username} Liked your comment: "${notification.data.content.comment}"`
      break
    default:
      message = 'You have a new notification'
    }

    return {
      ...notification,
      formattedMessage: message,
      timestamp: new Date(notification.timestamp || Date.now())
    }
  }


  return (
    <div className="notification-system">
      <div className={'notification-panel'}>
        <div className="notification-header">
          <h3>Notifications</h3>
        </div>

        <div className="notification-content">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="notification-item"
              >
                <div className="notification-message">
                  {notification.formattedMessage}
                </div>
                <div className="notification-time">
                  {notification.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
export default NotificationSystem