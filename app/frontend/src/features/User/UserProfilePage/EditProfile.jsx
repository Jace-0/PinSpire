import { useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import Navigation from '../../../components/common/Navigation'
import Header from '../../../components/common/Header'
import CustomSnackbar from '../../../components/common/CustomSnackBar'
import { userService } from '../../../services/userService'



const EditProfile = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const { state } = useLocation()
  const { profile } = state || {}

  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  // Initialize form state with profile data
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
    pronouns: profile.pronouns || '',
    website_url: profile.website_url || null,
    username: profile.username || '',
    gender: profile.gender || 'male'
  })

  // If somehow we got here without profile data, redirect back
  if (!profile) {
    return <Navigate to={`/${user.username}`} replace />
  }


  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbarMessage('File size too large. Maximum size is 5MB')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
        return
      }
      if (!file.type.startsWith('image/')) {
        setSnackbarMessage('Only image files are allowed')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))

      // Automatically upload after selection
      try {
        const formData = new FormData() // Create new FormData object
        formData.append('avatar', file) // Add file to FormData with field name 'avatar'

        const response = await userService.updateAvatar(formData)

        if (response.success) {
          setSnackbarMessage('Profile photo updated successfully')
          setSnackbarSeverity('success')
          setOpenSnackbar(true)
          // navigate()

        }
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to update profile photo')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      }
    }
  }

  const triggerFileInput = () => {
    document.getElementById('avatar-file').click()
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
      const response = await userService.updateProfile(formData)
      if (response.success){
        setSnackbarMessage('Update successful!')
        setSnackbarSeverity('success')
        setOpenSnackbar(true)
        // setTimeout(() => {
        //   navigate(`/profile/${formData.username}`)
        // }, 2000)

      }
      // Handle form submission
    } catch (error) {
      console.error('Error updating profile:', error)
      setSnackbarMessage( error.message || 'Update failed')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }


  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnackbar(false)
  }

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
              src={previewUrl ||profile.avatar_url }
              alt="Profile photo"
              className="profile-image"
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-file"      // This ID is referenced in triggerFileInput
              type="file"
              onChange={handleFileSelect}  // This calls handleFileSelect when file is chosen
            />
            <button
              type="button"
              className="change-photo-btn"
              onClick={triggerFileInput}  // Add this onClick handler
            >
              Change
            </button>
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
        <CustomSnackbar
          open={openSnackbar}
          message={snackbarMessage}
          severity={snackbarSeverity}
          onClose={handleCloseSnackbar}
        />
      </div>
    </>
  )}

export default EditProfile