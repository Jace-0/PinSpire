// Content.jsx
import React, { useState, useRef , useEffect } from 'react'
import { boardService } from '../../../services/boardService'
const Content = ({ pinData, setPinData }) => {
  // File input reference
  const fileInputRef = useRef(null)

  // Image preview state
  const [imagePreview, setImagePreview] = useState(null)

  // Handler to trigger file input click
  const handleOpenFileExplorer = () => {
    fileInputRef.current.click()
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPinData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Cleanup previous preview URL to prevent memory leaks
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setImagePreview(URL.createObjectURL(file))
      setPinData(prev => ({
        ...prev,
        image: file
      }))
    }
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      // Cleanup previous preview URL to prevent memory leaks
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setImagePreview(URL.createObjectURL(file))
      setPinData(prev => ({
        ...prev,
        image: file
      }))
    }
  }

  const [ boards, setBoards ] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchUserBoards = async () => {
      setIsLoading(true)
      try {
        const response = await boardService.getUserBoards()
        if (response.success) {
          setBoards(response.boards)
        }
      } catch (err) {
        console.error('Error fetching boards:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserBoards()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleBoardSelect = (boardId) => {
    setPinData(prevData => ({
      ...prevData,
      boardId: boardId
    }))
    setShowDropdown(false)
  }

  // Find the selected board name
  const selectedBoard = boards.find(board => board.id === pinData.boardId)


  return (

    <>
      <div className="content-container">
        {/* Image Section */}
        <div className="image-section">
          <div className="image-wrapper"
            onDragOver={(e) => e.preventDefault()} // Enables dropping
            onDrop={handleDrop} // Handles the drop event
          >
            <input
              ref={fileInputRef}
              type="file"
              data-testid="file-input"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Pin preview"
                  className="pin-image"
                />
                <button className="edit-button"
                  onClick={handleOpenFileExplorer}
                >
                  <i className="fas fa-pen"
                  ></i>
                </button>
              </>
            ):(
              <div className="upload-container">
                {/* <i className="fa-solid fa-arrow-up-from-bracket"
                  onClick={handleOpenFileExplorer}
                  style={{ cursor: 'pointer' }}
                ></i> */}
                <p className="primary-text">Choose a file or drag and drop it here</p>
                <p className="secondary-text">We recommend using high quality .jpg files less than 20MB</p>
                <button className="explorer-button" onClick={handleOpenFileExplorer}>
                  Open Explorer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={pinData.title}
              onChange={handleInputChange}
              placeholder="Add a title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={pinData.description}
              onChange={handleInputChange}
              placeholder="Add a detailed description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="link">Link</label>
            <input
              type="url"
              id="link"
              name="link"
              value={pinData.link}
              onChange={handleInputChange}
              placeholder="Add a link"
            />
          </div>

          <div className="form-group board-selector-container" ref={dropdownRef}>
            <label htmlFor="board">Board</label>

            <div
              className="board-selector"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="selected-board">
                {selectedBoard ? (
                  <div className="board-option selected">
                    <div className="board-thumbnail">
                      <img
                        src={selectedBoard.cover_image_url}
                        alt={selectedBoard.name}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://via.placeholder.com/50x50?text=Board'
                        }}
                      />
                    </div>
                    <span>{selectedBoard.name}</span>
                  </div>
                ) : (
                  <span className="placeholder">Choose a board</span>
                )}
                <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
              </div>


              {showDropdown && (
                <div className="board-dropdown">
                  {isLoading ? (
                    <div className="loading-boards">Loading boards...</div>
                  ) : boards.length > 0 ? (
                    <>
                      {boards.map(board => (
                        <div
                          key={board.id}
                          className={`board-option ${board.id === pinData.boardId ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBoardSelect(board.id, board.name)
                          }}
                        >
                          <div className="board-thumbnail">
                            <img
                              src={board.cover_image_url}
                              alt={board.name}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://via.placeholder.com/50x50?text=Board'
                              }}
                            />
                          </div>
                          <span>{board.name}</span>
                          <span className="pin-count">{board.savedCount || 0} pins</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="no-boards">
                      <p>You don't have any boards yet.</p>
                      <button
                        className="create-board-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle create board action
                        }}
                      >
                        <i className="fas fa-plus"></i> Create board
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hidden select for form submission */}
            <select
              id="board"
              name="board"
              value={pinData.boardId}
              onChange={handleInputChange}
              style={{ display: 'none' }}
            >
              <option value="">Choose a board</option>
              {boards && boards.map(board => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>

          {/* Not needed for now */}
          <div className="form-group">
            <label>Tagged topics (0)</label>
            <input type="text" placeholder="Search for a tag" />
            <p className="helper-text">Don't worry, people won't see your tags</p>
          </div>

          <div className="form-group">
            <button className="add-products-button">Add products</button>
          </div>

          <div className="form-group">
            <button className="more-options-button">
              More options
              <i className="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Content