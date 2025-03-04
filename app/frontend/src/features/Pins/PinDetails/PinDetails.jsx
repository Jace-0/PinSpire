import Header from '../../../components/common/Header'
import Navigation from '../../../components/common/Navigation'
import { pinService } from '../../../services/pinService'
import { useEffect, useState, useRef, } from 'react'
import { usePin } from '../../../context/PinContext'
import { useParams, Link } from 'react-router-dom'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const PinDetails = () => {
  const { id } = useParams()
  const { pin, loading, getPin } = usePin()

  useEffect(() => {
    getPin(id)
  }, [id, getPin])

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

/* Image Section Component */
const PinImageSection = () => {
  const { pin }  = usePin()
  console.log('PIN ', pin)
  return (
    <div className="pin-details-image-section">
      <img
        src={pin.image_url}
        alt="Pin image"
        className="pin-main-image"
      />
    </div>)
}

/* Pin Content section Component */
const PinContentSection = () => {
  return (
    <div className="pin-details-content">
      <UserInfo/>
      <PinInfo />
      <PinCommentsSection/>
    </div>)
}

/* User info Component - PinContentSection */
const UserInfo = () => {
  const { pin, handleLike } = usePin()
  const user = pin.user
  console.log('USER,', user)

  return (
    <div className="user-info-container">
      <div className="user-details">
        <img
          src={user.avatar_url}
          alt="profile image"
          className="profile-image"
        />
        <Link to={`/profile/${user.username}`}>
          <h2 className='user-username'>{user.username}</h2>
        </Link>
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
/* Pin info Component - PinContentSection */
const PinInfo = () => {
  const { pin } = usePin()

  const [isExpanded, setIsExpanded] = useState(false)
  const maxLength = 100

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
/* Pin Comment section Component - PinContentSection */
const PinCommentsSection = () => {
  const { pin } = usePin()
  const [ isExpanded , setIsExpanded ] = useState(false)

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

// Comment on Pin
const PinCommentInput = () => {
  const [ comment, setComment ] = useState('')
  const { handleComment } = usePin()

  const handleSumbit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    try {
      await handleComment(comment)
      setComment('')
    }catch (error) {
      console.error('Error submitting comment:', error)
    }
  }

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
        onClick={handleSumbit}
        disabled={!comment.trim()}
      >
        <i className="fas fa-paper-plane"></i>
      </button>
    </div>
  )
}

/* Pin Comment List Component - pinCommentSection */
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

/* Comment Section Component - pinCommentSection */
const CommentSection = ({ comment }) => {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const { handleCommentReply, handleCommentLike } = usePin()
  const [showReplies, setShowReplies] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0

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


  /* Reply to comments */
  const InputCommentReply = () => {
    const [localReplyComment, setLocalReplyComment] = useState('')
    const inputRef = useRef(null)
    const handleSubmitReply = async () => {
      if (!localReplyComment.trim()) return

      try {
        await handleCommentReply(comment.id, localReplyComment)
        setLocalReplyComment('')
        setShowReplyInput(false)
      } catch (error) {
        console.error('Error submitting reply:', error)
      }
    }

    return (
      <div className="reply-input-container">
        <input
          ref={inputRef}
          type="text"
          value={localReplyComment}
          onChange={(e) => setLocalReplyComment(e.target.value)}
          placeholder="Reply"
          className="reply-input"
          autoFocus
        />
        <button
          className="reply-submit"
          onClick={handleSubmitReply}
          disabled={!localReplyComment.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    )
  }

  /* Like comment */
  const handleLikeComment = async (e) => {
    e.preventDefault()
    await handleCommentLike(comment.id)
  }

  /* Comment Replies component */
  const CommentReplies = ({ replies }) => {
    // console.log('REPLIES', replies)
    const [showNestedReplyInput, setShowNestedReplyInput] = useState(false)
    const [nestedReplyComment, setNestedReplyComment] = useState('')
    const nestedInputRef = useRef(null)

    const { handleCommentReply } = usePin()

    // Initialize nested reply with @username
    const initializeNestedReplyWithMention = (username) => {
      setNestedReplyComment(`@${username} `)
      setShowNestedReplyInput(true)
    }

    // Focus and place cursor at end for nested replies
    useEffect(() => {
      if (showNestedReplyInput && nestedInputRef.current) {
        nestedInputRef.current.focus()
        const length = nestedInputRef.current.value.length
        nestedInputRef.current.setSelectionRange(length, length)
      }
    }, [showNestedReplyInput])

    const handleNestedReplySubmit = async () => {
      if (!nestedReplyComment.trim()) return
      try {
        await handleCommentReply(replies.id, nestedReplyComment)
        setNestedReplyComment('')
        setShowNestedReplyInput(false)
      } catch (error) {
        console.error('Error submitting nested reply:', error)
      }
    }


    /* Like comment */
    const handleLikeComment = async (e) => {
      e.preventDefault()
      await handleCommentLike(replies.id)
    }

    return (
      <div className="pin-comment">
        <div className="comment-main">
          <img
            src={replies.user.avatar_url}
            alt="User profile"
            className="comment-user-avatar"
          />
          <div className="comment-content">
            <div className='comment-header'>
              <Link to={`/profile/${replies.user.username}`}>
                <span className="comment-username">{replies.user.username}</span>
              </Link>
              <span className="comment-text">{replies.content}</span>
            </div>

            <div className="comment-actions">
              <span className="comment-time">
                {formatTimeAgo(replies.created_at)}
              </span>

              <button
                className="reply-button"
                onClick={() => initializeNestedReplyWithMention(replies.user.username)}
              >
                reply
              </button>
              <button
                className="like-button"
                onClick={handleLikeComment}
              >
                <i className="fas fa-heart"></i>
              </button>
              {replies?.likes_count > 0 && <h2 className="like-count">{ replies?.likes_count}</h2>}

            </div>

            {showNestedReplyInput && (
              <div className="reply-input-container">
                <input
                  ref={nestedInputRef}
                  type="text"
                  value={nestedReplyComment}
                  onChange={(e) => setNestedReplyComment(e.target.value)}
                  placeholder="Reply"
                  className="reply-input"
                  autoFocus
                />
                <button
                  className="reply-submit"
                  onClick={handleNestedReplySubmit}
                  disabled={!nestedReplyComment.trim()}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    )
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
          <div className="comment-header">
            <Link to={`/profile/${comment.user.username}`}>
              <span className="comment-username">{comment.user.username}</span>
            </Link>
            <span className="comment-text">{comment.content}</span>
          </div>
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

export default PinDetails