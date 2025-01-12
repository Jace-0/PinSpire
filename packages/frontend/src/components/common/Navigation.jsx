import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navigation = () => {
  const { user: loggedInUser, handleLogout } = useAuth()

  return (
    <div className="sidebar">
      <div className="nav-icons">
        {[
          { icon: 'fa-home', to: '/' },
          { icon: 'fa-bell', to: '/pin' },
          { icon: 'fa-plus', to: '/pin-creation-tool' },
          { icon: 'fa-comment-dots', to: '/messages' },
          { icon: 'fa-user', to: `/${loggedInUser.username}` },
        ].map(({ icon, to }) => (
          <Link key={icon} to={to}>
            <i className={`fas ${icon}`}></i>
          </Link>
        ))}
      </div>
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