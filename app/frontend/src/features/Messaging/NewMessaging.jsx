
import { useState, useEffect, useCallback } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { userService } from '../../services/userService'
import { chatService } from '../../services/chatService'
import { ChatContexts } from '../../context/ChatContext'

const NewMessaging = () => {
  const [username, setUsername] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    setSelectedChat,
    setOpenChat,
    setIsNewMessageBodyOpen,
    setIsInitialized
  } = ChatContexts()

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

  // Debounce search to avoid too many API calls
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

  const createNewChat = async (userId) => {
    const chat = await chatService.createNewChat(userId)
    setSelectedChat(chat.id)
    setIsNewMessageBodyOpen(false)
    setOpenChat(true)
    setIsInitialized(false) //update chat list


  }

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Find by username"
          value={username}
          onChange={handleInputChange}
        />
        <i className="fas fa-search search-icon"></i>
      </div>

      {/* Results section */}
      {isLoading ? (
        <div className="search-results loading"><LoadingSpinner/></div>
      ) : (
        username && searchResults.length > 0 ? (
          <><h3 className='search-result-list'>People</h3>
            <div className="search-results">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="search-result-item"
                  onClick={() => createNewChat(result.id)}
                >
                  <img
                    src={result.avatar_url}
                    alt={result.username}
                    className="result-avatar" />
                  <div className="result-info">
                    <span className="result-name">{result.name}</span>
                    <span className="result-username">@{result.username}</span>

                  </div>
                </div>
              ))}
            </div></>
        ) :
          <h3 className='result-empty'>No result found</h3>
      )}
    </div>
  )
}

export default NewMessaging