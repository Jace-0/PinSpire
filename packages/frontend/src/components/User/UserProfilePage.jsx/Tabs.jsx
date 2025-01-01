const Tabs = ({ activeTab, onTabChange }) => (
  <div className="tabs">
    <button
      className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
      onClick={() => onTabChange('created')}
    >
      Created
    </button>
    <button
      className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
      onClick={() => onTabChange('saved')}
    >
      Saved
    </button>
  </div>
)

export default Tabs