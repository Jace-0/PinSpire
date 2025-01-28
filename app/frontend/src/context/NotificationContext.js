import React, { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react'
import WebSocketManager from '../utils/websocketManager'
import { useAuth } from './AuthContext'


const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const { isConnected } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState(new Set())
  const wsClient = useRef(null)
  const lastProcessedTimestamp = useRef(null)
  const DEBOUNCE_TIME = 1000 // 1 second window to prevent duplicates

  // Wait for WebSocket connection before subscribing
  useEffect(() => {
    let subscribed = false

    const initializeNotifications = () => {
    // Check if WebSocket is initialized
      const ws = WebSocketManager.getInstance()

      if (ws && isConnected && !subscribed) {
        const handleNotification = (message) => {
          handleNewNotification(message.data)
        }

        WebSocketManager.subscribe('notification', handleNotification)
        subscribed = true
      } else {
      // If not connected, retry after a short delay
        setTimeout(initializeNotifications, 100)
      }
    }

    if (isConnected) {
      initializeNotifications()
    }

    return () => {
      subscribed = false
    }
  }, [isConnected])


  const handleNewNotification = (notification) => {
    const currentTimestamp = Date.now()
    // If this is a duplicate message within our time window, ignore it
    if (lastProcessedTimestamp.current &&
          currentTimestamp - lastProcessedTimestamp.current < DEBOUNCE_TIME) {
      return
    }
    lastProcessedTimestamp.current = currentTimestamp

    setNotifications(prevNotifications => {
      const formattedNotification = formatNotification(notification)

      // Check if notification with same content already exists
      const notificationExists = Array.from(prevNotifications).some(existingNotification =>
        existingNotification.formattedMessage === formattedNotification.formattedMessage &&
          Math.abs(existingNotification.timestamp - formattedNotification.timestamp) < DEBOUNCE_TIME
      )

      if (notificationExists) {
        return prevNotifications
      }

      const newNotifications = new Set(prevNotifications)
      newNotifications.add(formattedNotification)
      setUnreadCount(prev => prev + 1)
      return newNotifications
    })

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
      id: notification.id || `${notification.data.type}-${Date.now()}`,
      formattedMessage: message,
      timestamp: new Date(notification.timestamp || Date.now())
    }
  }

  const clearUnreadCount = () => {
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        clearUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// custom hooks

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}