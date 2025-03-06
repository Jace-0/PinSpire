// components
import { useState } from 'react'
import CreatedTab from './CreatedTab'
import LikedTab from './LikedTab'
import BoardTab from './BoardTab'
const Tabs = () => {

  const [activeTab, setActiveTab] = useState('created')

  const renderTabContent = () => {
    switch (activeTab) {
    case 'created':
      return <CreatedTab />
    case 'liked':
      return <LikedTab />
    case 'board':
      return <BoardTab />
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
          className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          Liked
        </button>
        <button
          className={`tab-button ${activeTab === 'board' ? 'active' : ''}`}
          onClick={() => setActiveTab('board')}
        >
          Board
        </button>
      </div>
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default Tabs