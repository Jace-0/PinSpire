import { useEffect, useState } from 'react'
import { UserCnxt } from '../../../context/UserContext'
import { useAuth } from '../../../context/AuthContext'
import { userService } from '../../../services/userService'
import PinCard from '../UserHomePage/PinCard'
import LoadingSpinner from '../../common/LoadingSpinner'
const LkedTab  = () => {
//   const { user: loggedInUser } = useAuth()
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

    // if (profile.data.id) {
    fetchPins()

  }, [profile.data.id, getLikedPins])

  if (loading) return <LoadingSpinner />
  if (error) return <div>Error loading pins: {error}</div>
  if (!pins?.length) return <div>No pins liked yet</div>

  console.log('Liked Pins ', pins )

  return (
    <div className="p-grid">
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin.likeable} />
      ))}
    </div>
  )
}

export default LkedTab