/* eslint-disable no-undef */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCnxt } from '../../../context/UserContext'
import CustomSnackbar from '../../common/CustomSnackBar'


const ProfileSection = ({ isOwnProfile, profile, updateProfile }) => {
  const navigate = useNavigate()
  const { handleFollowing, checkFollowStatus } = UserCnxt()

  const [isFollowed, setIsFollowed] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const user = profile.data
  console.log('User', user)

  // Check initial follow state when component mounts
  useEffect(() => {
    const followStatus = async () => {
      try {
        const response = await checkFollowStatus(user.id)
        setIsFollowed(response.isFollowing)
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }

    if (!isOwnProfile && user.id) {
      followStatus()
    }
  }, [user.id, isOwnProfile, checkFollowStatus])



  const handleEditProfile = () => {
    if (isOwnProfile) {
      // Pass profile data through navigation state
      navigate('/settings/profile', {
        state: { profile }
      })
    }
  }

  const handleFollow = async (profileId) => {
    try {

      console.log('PROFILE ID ', profileId)
      const response = await handleFollowing(profileId)
      await updateProfile()
      setSnackbarMessage(response.message + user.username)
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
      // setIsFollowed(!isFollowed)
    } catch (error) {
      setSnackbarMessage(error.message)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      setIsFollowed(false)

    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnackbar(false)
  }

  return(
    <><div className="profile-section">
      <img
        alt={`${user.username}'s profile`}
        height="100"
        src={user.avatar_url}
        width="100" />
      <h1>{user.first_name} {user.last_name}</h1>
      <p>@{user.username}</p>
      <p>{user.followers_count} followers · {user.following_count} following</p>
      {user.bio && <p>bio: {user.bio}</p>}


      <div className="buttons">
        {isOwnProfile ? (
          // Show edit button for own profile
          <button
            className="edit-btn"
            onClick={handleEditProfile}>
            Edit profile
          </button>
        ) : (
          // Show follow/share buttons for other profiles
          <>
            <button
              className="follow-btn"
              onClick={() => handleFollow(profile.data.id)}
            >
              {isFollowed ? 'Following' : 'Follow'}
            </button>
            <button
              className="msg-btn"
              onClick={() => handleShare(profile.data.username)}
            >
              Message
            </button>
          </>
        )}
      </div>
    </div><CustomSnackbar
      open={openSnackbar}
      message={snackbarMessage}
      severity={snackbarSeverity}
      onClose={handleCloseSnackbar} /></>
  )
}

export default ProfileSection