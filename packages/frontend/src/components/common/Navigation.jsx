import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import NotificationSystem from '../notification/NotificationSystem'
import LoadingSpinner from './LoadingSpinner'

const Navigation = () => {
  const { user: loggedInUser, handleLogout, accessToken, loading } = useAuth()
  const { unreadCount, clearUnreadCount } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)

  // NEED FIXING LATER, websocket issue
  let notificationCount = unreadCount/2
  if (!loggedInUser) return <LoadingSpinner/>

  const handleBellClick = (e) => {
    e.preventDefault() // Prevent navigation
    setShowNotifications(!showNotifications)
    clearUnreadCount()
  }

  console.log('NOTIFICATION COUNT', unreadCount/2)

  return (
    <div className="sidebar">
      <div className="nav-icons">
        {[
          { icon: 'fa-home', to: '/' },
          { icon: 'fa-bell',
            to: '#' ,
            onClick: handleBellClick,
            showBadge: true // Only bell icon should show badge
          },
          { icon: 'fa-plus', to: '/pin-creation-tool' },
          { icon: 'fa-comment-dots', to: '/messages' },
          { icon: 'fa-user', to: `/${loggedInUser.username}` },
        ].map(({ icon, to, onClick, showBadge }) => (
          <Link key={icon} to={to} onClick={onClick}>
            <i className={`fas ${icon}`}>
              {showBadge && notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
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

      <div
        onClick={handleLogout}
        className="logout-wrapper"
      >
        <i className="fas fa-sign-out-alt"></i>
        <span className="logout-text">Logout</span>
      </div>
    </div>
  )

}

export default Navigation