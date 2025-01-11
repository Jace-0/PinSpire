import { createContext, useContext, useState } from 'react'
import { handleApiError } from '../utils/errorHandler'
import { userService } from '../services/userService'
const UserContext = createContext()

export const UserProvider = ({ children }) => {

  const handleFollowing = async (profileId) => {
    try {
      const response = await userService.followUser(profileId)
      return response
    } catch (error) {
      console.error('Error following user', error)
      throw handleApiError(error)
    }
  }

  const checkFollowStatus = async (userId) => {
    const response = await userService.checkFollowStatus(userId)
    return response
  }
  const value = {
    handleFollowing,
    checkFollowStatus,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const UserCnxt = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('UserCnxt must be used within the UserProvider')
  }
  return context
}
