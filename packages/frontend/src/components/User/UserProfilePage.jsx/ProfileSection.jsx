/* eslint-disable no-undef */

import { useNavigate } from 'react-router-dom'

const ProfileSection = ({ isOwnProfile, profile }) => {
  const navigate = useNavigate()


  const handleEditProfile = () => {
    if (isOwnProfile) {
      // Pass profile data through navigation state
      navigate('/settings/profile', {
        state: { profile }
      })
    }
  }
  const user = profile.data
  console.log('profile user', profile)

  return(
    <div className="profile-section">
      <img
        alt={`${user.username}'s profile`}
        height="100"
        src={user.avatar_url}
        width="100"
      />
      <h1>{user.first_name} {user.last_name}</h1>
      <p>@{user.username}</p>
      <p>1B following</p>


      <div className="buttons">
        {isOwnProfile ? (
        // Show edit button for own profile
          <button onClick={handleEditProfile}>
            Edit profile
          </button>
        ) : (
        // Show follow/share buttons for other profiles
          <>
            <button onClick={() => handleFollow(profile.id)}>
              Follow
            </button>
            <button onClick={() => handleShare(profile.username)}>
              Share
            </button>
          </>
        )}
      </div>

      {/* Different views based on ownership */}
      {/* {isOwnProfile ? (
      <UserPins pins={profile.pins} editable={true} />
    ) : (
      <UserPins pins={profile.pins} editable={false} />
    )} */}


      {/* <div className="buttons">
      <button onClick={user.onShare}>Share</button>
      <button onClick={user.onEditProfile}>Edit profile</button>
    </div> */}
    </div>
  )
}

export default ProfileSection