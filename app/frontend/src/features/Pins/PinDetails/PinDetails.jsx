import Header from '../../../components/common/Header'
import Navigation from '../../../components/common/Navigation'
import { pinService } from '../../../services/pinService'
import { useEffect, useState, useRef } from 'react'
import { usePin } from '../../../context/PinContext'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const PinDetails = () => {
  const { id } = useParams()
  const { pin, loading, getPin } = usePin()

  useEffect(() => {
    getPin(id)
  }, [id])

  if (loading) return <LoadingSpinner/>
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
    </div>
  )
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
      <h3 className="pin-description">{renderDescription()}</h3>
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
        <CommentSection
          key={comment.id}
          comment={comment}
        />
      ))}
    </div>)
}

const CommentSection = ({ comment }) => {

  const [showReplyInput, setShowReplyInput] = useState(false)
  const { replyComment, setReplyComment , handleCommentReply, setCommentId, handleCommentLike } = usePin()
  const inputRef = useRef(null)
  const [showReplies, setShowReplies] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleSubmitReply = async () => {
    if (!replyComment.trim()) return

    try {
      setCommentId(comment.id)
      await handleCommentReply()
      setShowReplyInput(false)
    } catch (error) {
      console.error('Error submitting reply:', error)
    }
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    const days = Math.floor(seconds / 86400)

    if (days === 0) return 'today'
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }


  // comment Replies
  const CommentReplies = ({ replies }) => {
    return (
      <div className="pin-comment">
        <div className="comment-main">
          <img
            src={replies.user.avatar_url}
            alt="User profile"
            className="comment-user-avatar"
          />
          <div className="comment-content">
            <span className="comment-username">{replies.user.username}</span>
            <span className="comment-text">{replies.content}</span>

            <div className="comment-actions">
              <span className="comment-time">
                {formatTimeAgo(replies.created_at)}
              </span>

              <button className="reply-button" > reply</button>
              <button className="like-button">
                <i className="fas fa-heart"></i>
              </button>
            </div>
            {/* {showReplyInput && <InputCommentReply />} */}

          </div>
        </div>
      </div>
    )
  }


  // Reply to comments
  const InputCommentReply = () => {

    return (
      <div className="reply-input-container">
        <input
          ref={inputRef}
          type="text"
          value={replyComment}
          onChange={(e) => setReplyComment(e.target.value)}
          placeholder="Reply"
          className="reply-input"
          autoFocus
        />
        <button
          className="reply-submit"
          onClick={handleSubmitReply}
          disabled={!replyComment.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>)
  }

  const handleLikeComment = async (e) => {
    e.preventDefault()
    await handleCommentLike(comment.id)
  }





  return(
    <div className="pin-comment">
      <div className="comment-main">
        <img
          src={comment.user.avatar_url}
          alt="User profile"
          className="comment-user-avatar"
        />
        <div className="comment-content">
          <span className="comment-username">{comment.user.username}</span>
          <span className="comment-text">{comment.content}</span>

          <div className="comment-actions">
            <span className="comment-time">
              {formatTimeAgo(comment.created_at)}
            </span>

            <button className="reply-button" onClick={() => setShowReplyInput(!showReplyInput)}> reply</button>
            <button className="like-button" onClick={handleLikeComment}>
              <i className="fas fa-heart"></i>
            </button>
            {comment.likes_count > 0 && <h2 className="like-count">{comment.likes_count}</h2>}

          </div>

          {hasReplies && (
            <div className="replies-section">
              <button
                className={`show-replies-btn ${showReplies ? 'active' : ''}`}
                onClick={() => setShowReplies(!showReplies)}
              >
                <i className={`fas fa-chevron-${showReplies ? 'up' : 'down'}`}></i>
                {`${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
              </button>

              <div className={`replies-container ${showReplies ? 'show' : ''}`}>
                {comment.replies.map((replies) => (
                  <CommentReplies
                    key={replies.id}
                    replies={replies}
                  />
                ))}
              </div>
            </div>
          )}

          {showReplyInput && <InputCommentReply />}

        </div>
      </div>
    </div>
  )
}

// Comment on a pin
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
    </div>
  )
}

export default PinDetails