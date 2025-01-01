// pages/UserHomePage.jsx
import PinCard from './PinCard'
import Header from '../../common/Header'
import Navigation from '../../common/Navigation'

import bahamas from './bahamas.jpeg'
const UserHomePage = () => {
  const pins = [
    // Your pin data array
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    { id: 1, image: bahamas, title: 'Pin 1' },
    // ... more pins
  ]

  const user={
    name: 'John Doe',
    avatar: 'user-avatar.jpg'
  }

  return (
    <>
      <Header />
      <Navigation />
      <div className="home-container">
        <div className="pins-grid">
          {pins.map((pin) => (
            <PinCard key={pin.id} image={pin.image} title={pin.title} user={ user } />
          ))}
        </div>
      </div></>
  )
}

export default UserHomePage