
const ProfileSection = ({ user }) => (
  <div className="profile-section">
    <img
      alt={`${user.name}'s profile`}
      height="100"
      src={user.profileImage}
      width="100"
    />
    <h1>{user.name}</h1>
    <p>@{user.username}</p>
    <p>{user.followingCount} following</p>
    <div className="buttons">
      <button onClick={user.onShare}>Share</button>
      <button onClick={user.onEditProfile}>Edit profile</button>
    </div>
  </div>
)

export default ProfileSection