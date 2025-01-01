const PinCard = ({ image, title, user }) => {
  return (
    <div className="pin-card">
      <div className="pin-image-container">
        <img src={image} alt={title} className="pin-image" />
        <div className="pin-overlay">
          <h3 className="pin-title">{title}</h3>
        </div>
      </div>

      <div className="pin-footer">
        <img
          src={user.avatar}
          alt={user.name}
          className="user-avatar"
        />
        <span className="user-name">{user.name}</span>
      </div>
    </div>
  )
}

export default PinCard