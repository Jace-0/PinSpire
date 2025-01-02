import { useState } from 'react'
import Navigation from '../../common/Navigation'
import Header from '../../common/Header'
import { useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

import { userService } from '../../../services/userService'



const EditProfile = ({ user }) => {
  const { state } = useLocation()
  const { profile } = state || {}

  // Initialize form state with profile data
  const [formData, setFormData] = useState({
    first_name: profile.data.first_name || '',
    last_name: profile.data.last_name || '',
    bio: profile.data.bio || '',
    pronouns: profile.data.pronouns || '',
    website_url: profile.data.website_url || '',
    username: profile.data.username || '',
    gender: profile.data.gender || 'male'
  })

  // If somehow we got here without profile data, redirect back
  if (!profile) {
    return <Navigate to={`/${user.username}`} replace />
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('Data', formData)
      const response = await userService.updateProfile(profile.data.id, formData)
      console.log('Update', response.data)
      // Handle form submission
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }



  console.log('PROFILE', profile)

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
              src={profile.profileImage || 'https://storage.googleapis.com/a1aa/image/WhEQI3wRIuoLB1ABcr3JDoedcbaPBhuF780xUIDijocJ3LAKA.jpg'}
              alt="Profile photo"
              className="profile-image"
            />
            <button className="change-photo-btn">Change</button>
          </div>

          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="form-field">
              <label htmlFor="firstName">First name</label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="about">About</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell your story"
              />
            </div>

            <div className="form-field">
              <label htmlFor="lastName">Gender</label>
              <select
                id="gender"
                value={formData.gender || 'male'} // Fallback to male if undefined
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer not to say">prefer not to say</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="pronouns">Pronouns</label>
              <select
                id="pronouns"
                value={formData.pronouns}
                onChange={handleChange}
              >
                <option value="">Add your pronouns</option>
                {/* Add pronoun options */}
              </select>
              <span className="helper-text">
                Choose up to 2 sets of pronouns to appear on your profile so others know how to refer to you. You can edit or remove these any time.
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="website">Website</label>
              <input
                id="website_url"
                type="text"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://"
              />
              <span className="helper-text">
                Add a link to drive traffic to your site
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                readOnly
              />
              <span className="helper-text">www.pinspire.com/{formData.username}</span>
            </div>

            <button type="submit" className="save-button">
              Save
            </button>
          </form>
        </div>
      </div>
    </>
  )}

export default EditProfile