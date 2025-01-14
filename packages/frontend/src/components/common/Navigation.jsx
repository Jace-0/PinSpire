import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationSystem from '../notification/NotificationSystem'
import LoadingSpinner from './LoadingSpinner'

const Navigation = () => {
  const { user: loggedInUser, handleLogout, accessToken, loading } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  if (!loggedInUser) return <LoadingSpinner/>

  const handleBellClick = (e) => {
    e.preventDefault() // Prevent navigation
    setShowNotifications(!showNotifications)
  }




  return (
    <div className="sidebar">
      <div className="nav-icons">
        {[
          { icon: 'fa-home', to: '/' },
          { icon: 'fa-bell',
            to: '#' ,
            onClick: handleBellClick,

            render: () => (
              <>
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount}
                  </span>
                )}
              </>
            )
          },
          { icon: 'fa-plus', to: '/pin-creation-tool' },
          { icon: 'fa-comment-dots', to: '/messages' },
          { icon: 'fa-user', to: `/${loggedInUser.username}` },
        ].map(({ icon, to, onClick }) => (
          <Link key={icon} to={to} onClick={onClick}>
            <i className={`fas ${icon}`}></i>
          </Link>
        ))}
      </div>

      {/* Show notifications panel when bell is clicked */}
      {showNotifications && (
        <div>
          <NotificationSystem token={accessToken} />
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