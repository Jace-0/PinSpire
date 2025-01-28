// context/PinContext.js
import { createContext, useContext, useState } from 'react'
import { pinService } from '../services/pinService'
const PinContext = createContext()

export const PinProvider = ({ children }) => {
  const [pin, setPin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [replyComment, setReplyComment] = useState('')
  const [commentId, setCommentId] = useState('')

  const getPin = async (pinId) => {
    try {
      const response = await pinService.getPinById(pinId)
      setPin(response.data)
    } catch (error) {
      console.error('Error fetching pin:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      await pinService.addComment(pin.id, { content: comment })
      setComment('')
      // Refresh pin data
      await getPin(pin.id)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleLike = async () => {
    try {
      await pinService.likePin(pin.id)
      // Refresh pin data to get updated like count
      const updatedPin = await pinService.getPinById(pin.id)
      setPin(updatedPin.data)
    } catch (error) {
      console.error('Error liking pin:', error)
    }
  }

  const handleCommentReply = async () => {
    console.log('commentId', commentId)
    console.log('Content', replyComment)
    try {
      if (!commentId || !replyComment.trim()) return

      await pinService.replyComment(commentId, { content: replyComment })
      setReplyComment('')
      // Refresh pin data
      await getPin(pin.id)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }


  const handleCommentLike = async (commentId) => {
    try {
      console.log('CommentId =>', commentId)
      await pinService.likeComment(commentId)
      // Refresh pin data to get updated like count
      await getPin(pin.id)
    } catch (error) {
      console.error('Error liking pin:', error)
    }
  }

  const value = {
    pin,
    loading,
    comment,
    setComment,
    getPin,
    handleComment,
    handleLike,
    replyComment,
    setReplyComment,
    handleCommentReply,
    setCommentId,
    handleCommentLike
  }

  return <PinContext.Provider value={value}>{children}</PinContext.Provider>
}

export const usePin = () => {
  const context = useContext(PinContext)
  if (!context) {
    throw new Error('usePin must be used within a PinProvider')
  }
  return context
}