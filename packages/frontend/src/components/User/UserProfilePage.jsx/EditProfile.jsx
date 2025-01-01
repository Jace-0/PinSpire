import Navigation from '../../common/Navigation'
import Header from '../../common/Header'

const EditProfile = () => {
  return (
    <>
      <Navigation />
      <Header />
      <div className="edit-profile-container">
        <div className="edit-profile-content">
          <h1 className="edit-profile-title">Edit profile</h1>
          <p className="edit-profile-subtitle">
            Keep your personal details private. Information you add here is visible to anyone who can view your profile.
          </p>

          <div className="edit-profile-photo">
            <img
              src="https://storage.googleapis.com/a1aa/image/WhEQI3wRIuoLB1ABcr3JDoedcbaPBhuF780xUIDijocJ3LAKA.jpg"
              alt="Profile photo"
              className="profile-image"
            />
            <button className="change-photo-btn">Change</button>
          </div>

          <div className="edit-profile-form">
            <div className="form-field">
              <label htmlFor="first-name">First name</label>
              <input id="first-name" type="text" value="Jace" />
            </div>

            <div className="form-field">
              <label htmlFor="last-name">Last name</label>
              <input id="last-name" type="text" value="Freeman" />
            </div>

            <div className="form-field">
              <label htmlFor="about">About</label>
              <textarea id="about" placeholder="Tell your story"></textarea>
            </div>

            <div className="form-field">
              <label htmlFor="pronouns">Pronouns</label>
              <select id="pronouns">
                <option>Add your pronouns</option>
              </select>
              <span className="helper-text">
                Choose up to 2 sets of pronouns to appear on your profile so others know how to refer to you. You can edit or remove these any time.
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="website">Website</label>
              <input id="website" placeholder="https://" type="text" />
              <span className="helper-text">
                Add a link to drive traffic to your site
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input id="username" type="text" value="jacefreeman26" readOnly />
              <span className="helper-text">www.pinterest.com/jacefreeman26</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditProfile