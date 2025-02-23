import { useState, useEffect , useCallback, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import LoadingSpinner from './LoadingSpinner'
import { userService } from '../../services/userService'

const Header = () => {
  const { user: loggedInUser } = useAuth()
  const [username, setUsername] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef(null)

  const handleSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await userService.searchUser(username)
      setSearchResults(response)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [username])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        handleSearch()
      } else {
        setSearchResults([])
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [username, handleSearch])

  const handleInputChange = (e) => {
    setUsername(e.target.value)
  }

  const handleClickOutside = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setIsSearchOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="header" data-testid="header-search">
      <div className="header-search-container" ref={searchContainerRef}>
        <div className="header-search-bar">
          <input
            type="text"
            placeholder="Search users"
            onChange={handleInputChange}
            onFocus={() => setIsSearchOpen(true)}
          />
          <i className="fas fa-search"></i>
        </div>

        {isSearchOpen && (username || isLoading) && (
          <div className="search-dropdown">
            {isLoading ? (
              <div className="loading-container">
                <LoadingSpinner />
              </div>
            ): searchResults.length > 0 ? (
              <div className="user-search-results">
                <h3 className="results-title">People</h3>
                <div className="user-grid">
                  {searchResults.map((user) => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.username}`}
                      className="user-card"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <div className="s-user-avatar">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="s-user-info">
                        {user.name && <span className="s-name">{user.name}</span>}
                        <span className="s-username">@{user.username}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-results">No users found</div>
            )}
          </div>
        )}
      </div>


      <div className="profile">
        <Link to={`/profile/${loggedInUser?.username}`}>
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