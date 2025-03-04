// context/PinContext.js
import { createContext, useCallback, useContext, useState } from 'react'
import { pinService } from '../services/pinService'
const PinContext = createContext()

export const PinProvider = ({ children }) => {
  const [pin, setPin] = useState(null)
  const [loading, setLoading] = useState(true)

  const getPin = useCallback(async (pinId) => {
    try {
      const response = await pinService.getPinById(pinId)
      setPin(response.data)
    } catch (error) {
      console.error('Error fetching pin:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleComment = async (comment) => {
    await pinService.createComment(pin.id, { content: comment })
    // Refresh pin data
    await getPin(pin.id)
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

  const handleCommentReply = async (commentId, replyContent) => {
    try {
      if (!commentId || !replyContent.trim()) return

      await pinService.createComment(pin.id, { content: replyContent, parentId: commentId })
      // Refresh pin data
      await getPin(pin.id)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleCommentLike = async (commentId) => {
    try {
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
    getPin,
    handleComment,
    handleLike,
    handleCommentReply,
    handleCommentLike
  }

  return <PinContext.Provider value={value}>{children}</PinContext.Provider>
}

export const usePin = () => {
  const context = useContext(PinContext)
  if (!context) {
    throw new Error('usePin must be used within a AuthProvider')
  }
  return context
}