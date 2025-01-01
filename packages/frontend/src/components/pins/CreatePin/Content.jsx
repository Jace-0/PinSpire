// Content.jsx
const Content = () => {
  return (
    <div className="content-container">
      {/* Image Section */}
      <div className="image-section">
        <div className="image-wrapper">
          {/* <img
            src="https://storage.googleapis.com/a1aa/image/8kwfPNCMHPUzOSeyoVo9I6hs79iTTExfdtsCJ2AAc90lBtAoA.jpg"
            alt="A beautiful sunset with palm trees by the beach"
            className="pin-image"
          /> */}
          <div className="upload-container">
            <i className="fas fa-arrow-up-from-bracket upload-icon"></i>
            <p className="primary-text">Choose a file or drag and drop it here</p>
            <p className="secondary-text">We recommend using high quality .jpg files less than 20MB</p>
            <button className="url-button">
              <i className="fas fa-link"></i>
              Save from URL
            </button>
          </div>

          <button className="edit-button">
            <i className="fas fa-pen"></i>
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <div className="form-group">
          <label>Title</label>
          <input type="text" placeholder="Add a title" />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Add a detailed description"></textarea>
        </div>

        <div className="form-group">
          <label>Link</label>
          <input type="text" placeholder="Add a link" />
        </div>

        <div className="form-group">
          <label>Board</label>
          <select>
            <option>Choose a board</option>
          </select>
        </div>

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
  )
}

export default Content