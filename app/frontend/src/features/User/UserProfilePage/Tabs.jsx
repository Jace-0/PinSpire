// components
import { useState } from 'react'
import CreatedTab from './CreatedTab'
import LikedTab from './LikedTab'
const Tabs = () => {

  const [activeTab, setActiveTab] = useState('created')

  const renderTabContent = () => {
    switch (activeTab) {
    case 'created':
      return <CreatedTab />
    case 'saved':
      return <LikedTab />
    default:
      return <CreatedTab />
    }
  }

  return (
    <div className="tabs-container" data-testid="tabs-container">
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Created
        </button>
        <button
          className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Liked
        </button>
      </div>
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default Tabs