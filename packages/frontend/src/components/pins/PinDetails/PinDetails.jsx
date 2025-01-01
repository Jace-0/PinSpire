import Header from '../../common/Header'
import Navigation from '../../common/Navigation'
const PinDetails = () => {
  return (
    <>
      <Header />
      <Navigation />
      <div className="pin-details-container">
        <div className="pin-details-wrapper">
          {/* Left Section - Image */}
          <div className="pin-details-image-section">
            <img
              src="https://storage.googleapis.com/a1aa/image/Cr1jEagrfzwefoerc50m1xXjelQr8O91jBeINmrnomjnhGGAF.jpg"
              alt="A beautiful view of the ocean with two coconuts held in hands"
              className="pin-main-image"
            />
          </div>

          {/* Right Section - Content */}
          <div className="pin-details-content">
            {/* Actions Bar */}
            <div className="pin-action-bar">
              <button className="pin-like-button">
                <i className="fas fa-heart"></i>
              </button>
            </div>

            {/* Title and Description */}
            <div className="pin-info">
              <h2 className="pin-title">bahamas</h2>
              <p className="pin-hashtags">#aesthetic #bahamas</p>
            </div>

            {/* Comments Section */}
            <div className="pin-comments-section">
              <p className="comments-count">3 Comments</p>

              <div className="pin-comments-list">
                {/* Individual Comment */}
                <div className="pin-comment">
                  <img
                    src="https://storage.googleapis.com/a1aa/image/vnA59JpuRP5xKdIBeqji2bfirEdUch4kQalPhkTWkXbIaYAUA.jpg"
                    alt="User profile"
                    className="comment-user-avatar"
                  />
                  <div className="comment-content">
                    <span className="comment-username">Layla</span>
                    <span className="comment-text">waa i miss summer</span>
                  </div>
                </div>
                {/* Repeat for other comments */}
              </div>

              {/* Comment Input */}
              <div className="pin-comment-input-wrapper">
                <input
                  type="text"
                  placeholder="Add a comment"
                  className="pin-comment-input"
                />
                <button className="pin-comment-submit">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default PinDetails