import React from 'react'
import { Link } from 'react-router-dom'

const Header = ({ onSearch }) => (
  <div className="header">
    <div className="search-bar">
      <input type="text" placeholder="Search..." onChange={onSearch} />
      <i className="fas fa-search"></i>
    </div>
    <div className="profile">
      <Link to="/profile"></Link>
      <i className="fas fa-user-circle"></i>
    </div>
  </div>
)

export default Header