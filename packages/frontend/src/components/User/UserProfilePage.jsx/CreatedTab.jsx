import { UserCnxt } from '../../../context/UserContext'
import { useAuth } from '../../../context/AuthContext'
import { useEffect, useState } from 'react'
import PinCard from '../UserHomePage/PinCard'
import LoadingSpinner from '../../common/LoadingSpinner'
const CreatedTab  = () => {
//   const { user: loggedInUser } = useAuth()
  const { getUserPins, profile } = UserCnxt()
  const [pins, setPins] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  console.log('Profile', profile)
  useEffect(() => {
    const fetchPins = async () => {
      try {
        setLoading(true)
        const userPins = await getUserPins(profile.data.id)
        setPins(userPins)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    // if (profile.data.id) {
    fetchPins()

  }, [profile.data.id, getUserPins])

  if (loading) return <LoadingSpinner />
  if (error) return <div>Error loading pins: {error}</div>
  if (!pins?.length) return <div>No pins created yet</div>

  return (
    <div className="p-grid">
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin} />
      ))}
    </div>
  )
}

export default CreatedTab