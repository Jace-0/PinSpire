import { useNavigate } from 'react-router-dom'
const PinCard = ({ pin }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/pin/${pin.id}`)
  }

  return (
    <div
      className="pin-card"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="pin-image-container">
        <img src={pin.image_url} alt={pin.title} className="pin-image" />
        <div className="pin-overlay">
          <h3 className="pin-title">{pin.title}</h3>
        </div>
      </div>

      <div className="pin-footer">
        <img
          src={pin.user.avatar_url}
          alt={pin.user.username}
          className="user-avatar"
        />
        <span className="user-name">{pin.user.username}</span>
      </div>
    </div>
  )
}

export default PinCard