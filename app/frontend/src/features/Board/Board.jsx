import React, { useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { boardService } from '../../services/boardService'
// import { useSnackbarNotification } from '../../context/snackbarNotificationContext'

import Navigation from '../../components/common/Navigation'
import Header from '../../components/common/Header'
import PinCard from '../User/UserHomePage/PinCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const Board = () => {
  const { username, boardName } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [ boardPins , setBoardPins ] = useState([])
  const [loading, setLoading] = useState(true)
  const [boardData, setBoardData] = useState(location.state?.boardData || null)

  //   const { showNotification } = useSnackbarNotification()
  const fetchBoardData = React.useCallback(async () => {
    try {
      // If we already have the board data from state, use it
      if (boardData) {
        const response = await boardService.getBoardPins(boardData.id)
        if (response.success){
          setBoardPins(response.board.pins)
        }
        setLoading(false)
        return
      }

      // Otherwise, fetch the board by username and board name
      const response = await boardService.getBoardPinsByUsernameAndName({ username, boardName })
      if (response.success) {
        setBoardData(response.board)
        setBoardPins(response.board.pins)

        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching board:', error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, boardName]) // didnt included boardData, fetch should happen once

  React.useEffect(() => {
    fetchBoardData()
  }, [fetchBoardData])

  if (loading) return <LoadingSpinner/>
  if (!boardPins) return <div>Profile not found</div>

  return (
    <div className="layout">
      <Navigation/>
      <Header/>
      <div className='board-content'>
        <div className="board-header">
          <h1>{boardData.name}</h1>
          <div className="board-meta">
            <h4 className="board-creator">
              Created by <Link to={`/profile/${username}`} className="username-link">{username}</Link>
            </h4>
            <h5 className="pin-count">{boardPins?.length} pins</h5>
          </div>
        </div>

        { boardPins && boardPins.length > 0
          ?
          (<div className="pins-grid">
            {boardPins.map(pin => (<PinCard key={pin.id} pin={pin}/>))}
          </div>)
          :
          (<h2 className='no-b-pins'>
            No pin Saved
          </h2>)
        }

      </div>
    </div>
  )
}

export default Board