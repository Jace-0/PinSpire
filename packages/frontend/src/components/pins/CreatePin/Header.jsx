// Header.jsx
const Header = ({ onPublish }) => {
  return (
    <div className="create-pin-header">
      <h1>Create Pin</h1>
      <button
        className="publish-button"
        onClick={onPublish}
      >Publish</button>
    </div>
  )
}

export default Header