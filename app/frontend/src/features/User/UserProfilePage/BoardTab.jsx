import React, { useState, useEffect } from 'react'
import { boardService } from '../../../services/boardService'
import { Link } from 'react-router-dom'

import { useAuth } from '../../../context/AuthContext'

const BoardTab = () => {
  const { user: loggedInUser } = useAuth()
  const [ boards, setBoards ] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')


  useEffect(() => {
    const fetchUserBoards = async () => {
      const response = await boardService.getUserBoards()
      if (response.success) {
        setBoards(response.boards)
      }
    }
    fetchUserBoards()
  }, [])



  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      const newBoard =  await boardService.createBoard(newBoardName)
      setBoards([...boards, newBoard?.board])
      setNewBoardName('')
      setShowCreateModal(false)
    }
  }

  return (
    <div className="board-container">
      <div className="tab-header">
        <h2> Your saved ideas </h2>

        <div
          className="create-board-button"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus"></i>
        </div>
      </div>

      <div className="board-grid">
        {/* Board Cards */}
        {boards && boards.map((board) => (
          <div key={board.id} className="board-card">
            <Link
              to={`/${loggedInUser?.username}/${board.name}`}
              state={{ boardData: board }}
            >
              <img
                src={board.cover_image_url}
                alt={board.name}
              />
              <div className="board-info">
                <h3>{board.name}</h3>
                <p>{board.savedCount} ideas</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create new board</h3>

            <div className="form-group">
              <label htmlFor="boardName">
                Board name
              </label>
              <input
                type="text"
                id="boardName"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name"
              />
            </div>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-button-b"
                onClick={handleCreateBoard}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BoardTab