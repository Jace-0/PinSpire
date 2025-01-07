import { useNavigate } from 'react-router-dom'
const PinCard = ({ image, title, user, id }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/pin/${id}`)
  }

  return (
    <div
      className="pin-card"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="pin-image-container">
        <img src={image} alt={title} className="pin-image" />
        <div className="pin-overlay">
          <h3 className="pin-title">{title}</h3>
        </div>
      </div>

      <div className="pin-footer">
        <img
          src={user.avatar_url}
          alt={user.username}
          className="user-avatar"
        />
        <span className="user-name">{user.username}</span>
      </div>
    </div>
  )
}

export default PinCard