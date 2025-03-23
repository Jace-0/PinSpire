import { useEffect, useState } from 'react'
import { UserCnxt } from '../../../context/UserContext'

import PinCard from '../UserHomePage/PinCard'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const LkedTab  = () => {
  const { getLikedPins, profile } = UserCnxt()
  const [pins, setPins] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPins = async () => {
      try {
        setLoading(true)
        const response = await getLikedPins()
        if (response.success){
          setPins(response.data)
        }
      } catch (error) {
        console.error('Error fetching liked pins:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPins()

  }, [profile.id, getLikedPins])

  if (loading) return <LoadingSpinner />
  if (error) return <div>Error loading pins: {error}</div>
  // if (!pins?.length) return <div>No pins liked yet</div>

  return (
    <>
      <div className='tab-headerP'>
        <h2 >Your Liked Pins</h2>
      </div>
      {!pins?.length && <div className='no-pins'>No pins liked yet</div>}

      <div className="p-grid">
        {pins.map((pin) => (
          <PinCard key={pin.id} pin={pin.likeable} />
        ))}
      </div>
    </>
  )
}

export default LkedTab