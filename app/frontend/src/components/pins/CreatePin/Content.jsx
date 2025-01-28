// Content.jsx
import { useState, useRef } from 'react'
const Content = ({ pinData, setPinData }) => {
  // File input reference
  const fileInputRef = useRef(null)

  // Image preview state
  const [imagePreview, setImagePreview] = useState(null)

  // Handler to trigger file input click
  const handleOpenFileExplorer = () => {
    fileInputRef.current.click()
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPinData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Cleanup previous preview URL to prevent memory leaks
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setImagePreview(URL.createObjectURL(file))
      setPinData(prev => ({
        ...prev,
        image: file
      }))
    }
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      // Cleanup previous preview URL to prevent memory leaks
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setImagePreview(URL.createObjectURL(file))
      setPinData(prev => ({
        ...prev,
        image: file
      }))
    }
  }


  return (

    <>
      <div className="content-container">
        {/* Image Section */}
        <div className="image-section">
          <div className="image-wrapper"
            onDragOver={(e) => e.preventDefault()} // Enables dropping
            onDrop={handleDrop} // Handles the drop event
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Pin preview"
                  className="pin-image"
                />
                <button className="edit-button"
                  onClick={handleOpenFileExplorer}
                >
                  <i className="fas fa-pen"
                  ></i>
                </button>
              </>
            ):(
              <div className="upload-container">
                <i className="fas fa-arrow-up-from-bracket upload-icon"
                  onClick={handleOpenFileExplorer}
                  style={{ cursor: 'pointer' }}
                ></i>
                <p className="primary-text">Choose a file or drag and drop it here</p>
                <p className="secondary-text">We recommend using high quality .jpg files less than 20MB</p>
                <button className="url-button">
                  <i className="fas fa-link"></i>
                  Save from URL
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={pinData.title}
              onChange={handleInputChange}
              placeholder="Add a title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              id="description"
              name="description"
              value={pinData.description}
              onChange={handleInputChange}
              placeholder="Add a detailed description"
            />
          </div>

          <div className="form-group">
            <label>Link</label>
            <input
              type="url"
              id="link"
              name="link"
              value={pinData.link}
              onChange={handleInputChange}
              placeholder="Add a link"
            />
          </div>

          <div className="form-group">
            <label>Board</label>
            <select
              id="board"
              name="board"
              value={pinData.board}
              onChange={handleInputChange}
            >
              <option value="">Choose a board</option>
              {/* Add board options dynamically */}
            </select>
          </div>

          {/* Not needed for now */}
          <div className="form-group">
            <label>Tagged topics (0)</label>
            <input type="text" placeholder="Search for a tag" />
            <p className="helper-text">Don't worry, people won't see your tags</p>
          </div>

          <div className="form-group">
            <button className="add-products-button">Add products</button>
          </div>

          <div className="form-group">
            <button className="more-options-button">
              More options
              <i className="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Content