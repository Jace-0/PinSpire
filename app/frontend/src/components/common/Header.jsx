import React from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

const Header = ({ onSearch }) => {
  const { user: loggedInUser } = useAuth()

  return (
    <div className="header">
      <div className="search-bar">
        <input type="text" placeholder="Search..." onChange={onSearch} />
        <i className="fas fa-search"></i>
      </div>
      <div className="profile">
        <Link to={`/${loggedInUser?.username}`}>
          {loggedInUser?.avatar_url ? (
            <img
              src={loggedInUser.avatar_url}
              alt="Profile"
              className="profile-avatar"
            />
          ) : (
            <i className="fas fa-user-circle"></i>
          )}
        </Link>
      </div>
    </div>
  )
}

export default Header