import { createContext, useContext, useState } from 'react'
import { handleApiError } from '../utils/errorHandler'
import { userService } from '../services/userService'
import { pinService } from '../services/pinService'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null)


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

  const getUserPins = async (username) => {
    const response = await pinService.getUserPins(username)
    return response
  }

  const getLikedPins = async () => {
    const response = await pinService.getLikedPins()
    return response
  }

  const value = {
    handleFollowing,
    checkFollowStatus,
    getLikedPins,
    getUserPins,
    profile,
    setProfile
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
