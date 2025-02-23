import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import NotificationSystem from '../../features/Notification/NotificationSystem'
import { ChatContexts } from '../../context/ChatContext'
import Messaging from '../../features/Messaging/Messaging'
import LoadingSpinner from './LoadingSpinner'

const Navigation = () => {
  const { user: loggedInUser, handleLogout } = useAuth()
  const { unreadCount, clearUnreadCount } = useNotifications()
  const { messageNotificationCount, clearMessageNotification } = ChatContexts()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)

  if (!loggedInUser) return <LoadingSpinner/>

  const handleBellClick = (e) => {
    e.preventDefault()
    if (showMessages) {
      setShowMessages(!showMessages)
    }
    setShowNotifications(!showNotifications)
    clearUnreadCount()
  }

  const handleMessageClick = (e) => {
    if (showNotifications){
      setShowNotifications(!showNotifications)
    }
    e.preventDefault()
    setShowMessages(!showMessages)
    clearMessageNotification()
  }

  return (
    <div className="sidebar" data-testid='sidebar-nav' >
      <div className="nav-icons">
        {[
          { icon: 'fa-home', to: '/' },
          { icon: 'fa-bell',
            to: '#' ,
            onClick: handleBellClick,
            showBadge: true,
            // NEED FIXING LATER, websocket issue
            badgeCount: unreadCount/2
          },
          { icon: 'fa-plus', to: '/pin-creation-tool' },
          { icon: 'fa-comment-dots',
            to: '#',
            onClick: handleMessageClick,
            showBadge: true,
            badgeCount: messageNotificationCount/2
          },
          { icon: 'fa-user', to: `/profile/${loggedInUser.username}` },
        ].map(({ icon, to, onClick, showBadge, badgeCount }) => (
          <Link key={icon} to={to} onClick={onClick}>
            <i className={`fas ${icon}`}>
              {showBadge && badgeCount > 0 && (
                <span className="notification-badge">{badgeCount}</span>
              )}
            </i>
          </Link>
        ))}


      </div>
      {/* Show notifications panel when bell is clicked */}
      {showNotifications && (
        <div>
          <NotificationSystem />
        </div>
      )}

      {showMessages && (
        <div>
          <Messaging/>
        </div>
      )}



      <div
        onClick={handleLogout}
        className="logout-wrapper"
        data-testid="logout-wrapper"
      >
        <i className="fas fa-sign-out-alt"></i>
        <span className="logout-text">Logout</span>
      </div>
    </div>
  )

}

export default Navigation