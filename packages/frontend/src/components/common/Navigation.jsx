import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navigation = () => {
  const { user: loggedInUser } = useAuth()

  return (<div className="sidebar">
    {[
      { icon: 'fa-home', to: '/' },
      { icon: 'fa-bell', to: '/notifications' },
      { icon: 'fa-plus', to: '/create' },
      { icon: 'fa-comment-dots', to: '/messages' },
      { icon: 'fa-user', to: `/${loggedInUser.username}` }
    ].map(({ icon, to }) => (
      <Link key={icon} to={to}>
        <i className={`fas ${icon}`}></i>
      </Link>
    ))}
  </div>)
}

export default Navigation