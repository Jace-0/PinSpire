/* eslint-disable no-undef */

import { useNavigate } from 'react-router-dom'

const ProfileSection = ({ user , isOwnProfile, profile }) => {
  const navigate = useNavigate()


  const handleEditProfile = () => {
    if (isOwnProfile) {
      // Pass profile data through navigation state
      navigate('/settings/profile', {
        state: { profile }
      })
    }
  }
  const userr = profile.data
  console.log('profile user', profile)

  return(
    <div className="profile-section">
      <img
        alt={`${userr.username}'s profile`}
        height="100"
        src={user.profileImage}
        width="100"
      />
      <h1>{userr.first_name} {userr.last_name}</h1>
      <p>@{userr.username}</p>
      <p>{user.followingCount} following</p>


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