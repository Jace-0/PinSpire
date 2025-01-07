import Header from '../../common/Header'
import Navigation from '../../common/Navigation'
import { pinService } from '../../../services/pinService'
import { useEffect, useState } from 'react'
import { usePin } from '../../../context/PinContext'
import { useParams } from 'react-router-dom'
const PinDetails = () => {
  const { id } = useParams()
  const { pin, loading, getPin } = usePin()

  useEffect(() => {
    getPin(id)
  }, [id])

  if (loading) return <h2>Loading...</h2>
  if (!pin) return <h2>Pin not found</h2>

  return (
    <>
      <Header />
      <Navigation />
      <div className="pin-details-container">
        <div className="pin-details-wrapper">
          <PinImageSection/>
          <PinContentSection/>
        </div>
      </div>
    </>
  )
}

const PinImageSection = () => {
  const { pin }  = usePin()
  return (
    <div className="pin-details-image-section">
      <img
        src={pin.image_url}
        alt="Pin image"
        className="pin-main-image"
      />
    </div>)
}


const PinContentSection = () => {
  return (
    <div className="pin-details-content">
      <UserInfo/>
      <PinInfo />
      <PinCommentsSection/>
    </div>)
}

const UserInfo = () => {
  const { pin, handleLike } = usePin()
  const user = pin.user
  console.log('PINNN', pin)

  return (
    <div className="user-info-container">
      <div className="user-details">
        <img
          src={user.avatar_url}
          alt="profile image"
          className="profile-image"
        />
        <h2 className='user-username'>{user.username}</h2>
      </div>
      <div className="like-container">
        <button
          className="pin-like-button"
          onClick={handleLike}
        >
          <i className="fas fa-heart"></i>
        </button>
        <h2 className="like-count">{pin.like_count}</h2>
      </div>
    </div>)
}


const PinInfo = () => {
  const { pin } = usePin()

  const [isExpanded, setIsExpanded] = useState(false)
  const maxLength = 100 // Adjust this value for your needs

  const toggleDescription = () => {
    setIsExpanded(!isExpanded)
  }

  const renderDescription = () => {
    if (pin.description.length <= maxLength) return pin.description

    if (isExpanded) {
      return (
        <>
          {pin.description}
          <button onClick={toggleDescription} className="show-more-btn">
            Show less
          </button>
        </>
      )
    }

    return (
      <>
        {pin.description.slice(0, maxLength)}...
        <button onClick={toggleDescription} className="show-more-btn">
          Show more
        </button>
      </>
    )
  }


  return (
    <div className="pin-info">
      <h1 className="pin-title-pin">{pin.title }</h1>
      <h3 className='pin-description'>{renderDescription()}</h3>
    </div>
  )
}

const PinCommentsSection = () => {

  const { pin } = usePin()
  const [ isExpanded , setIsExpanded] = useState(false)

  return (
    <div className="pin-comments-section">
      <div className="comments-header">
        <p className="comments-count">{pin.comment_count} comments</p>
        <button
          className="comments-toggle"
          onClick={() => setIsExpanded(!isExpanded)}>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {isExpanded && (
        <>
          <PinCommentsList />
        </>
      )}
      <PinCommentInput />
    </div>
  )
}

const PinCommentsList = () => {
  const { pin } = usePin()
  return (
    <div className="pin-comments-list">
      {pin.comments && pin.comments.map((comment) => (
        <PinComment
          key={comment.id}
          avatarUrl={comment.user.avatar_url}
          username={comment.user.username}
          text={comment.content}
        />
      ))}
    </div>)
}

const PinComment = ({ avatarUrl, username, text }) => (
  <div className="pin-comment">
    <img
      src={avatarUrl}
      alt="User profile"
      className="comment-user-avatar"
    />
    <div className="comment-content">
      <span className="comment-username">{username}</span>
      <span className="comment-text">{text}</span>
    </div>
  </div>
)


const PinCommentInput = () => {

  const { comment, setComment, handleComment } = usePin()

  return (

    <div className="pin-comment-input-wrapper">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment"
        className="pin-comment-input"
      />
      <button
        className="pin-comment-submit"
        onClick={handleComment}
        disabled={!comment.trim()}
      >
        <i className="fas fa-paper-plane"></i>
      </button>
    </div>)
}

export default PinDetails