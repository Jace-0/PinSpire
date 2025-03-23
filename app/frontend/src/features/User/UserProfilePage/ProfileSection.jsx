/* eslint-disable no-undef */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCnxt } from '../../../context/UserContext'
import CustomSnackbar from '../../../components/common/CustomSnackBar'


const ProfileSection = ({ isOwnProfile, profile, updateProfile }) => {
  const navigate = useNavigate()
  const { handleFollowing, checkFollowStatus } = UserCnxt()

  const [isFollowed, setIsFollowed] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')



  // Check initial follow state when component mounts
  useEffect(() => {
    const followStatus = async () => {
      try {
        const response = await checkFollowStatus(profile.id)
        setIsFollowed(response.isFollowing)
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }

    if (!isOwnProfile && profile.id) {
      followStatus()
    }
  }, [profile.id, isOwnProfile, checkFollowStatus])



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

      const response = await handleFollowing(profileId)
      await updateProfile()
      // setSnackbarMessage(`${response.message} ${ profile.username}`)
      // setSnackbarSeverity('success')
      // setOpenSnackbar(true)
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
    <div className='profile-wrapper'>
      <div className="profile-section">
        <img
          alt={`${profile.username}'s profile`}
          height="100"
          src={profile.avatar_url}
          width="100" />
        <h1>{profile.first_name} {profile.last_name}</h1>
        <p>@{profile.username}</p>
        <p>{profile.followers_count} followers · {profile.following_count} following</p>
        {profile.bio && <p>bio: {profile.bio}</p>}


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
                onClick={() => handleFollow(profile.id)}
              >
                {isFollowed ? 'Following' : 'Follow'}
              </button>
              <button
                className="msg-btn"
                onClick={() => handleShare(profile.username)}
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
        onClose={handleCloseSnackbar} />
    </div>
  )
}

export default ProfileSection