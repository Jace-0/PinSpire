// pages/PinFeed.jsx
import { useEffect, useState, useRef, useCallback } from 'react'
import { pinService } from '../../../services/pinService'
import PinCard from './PinCard'
import Header from '../../common/Header'
import Navigation from '../../common/Navigation'


import bahamas from './bahamas.jpeg'
const PinFeed = () => {
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)


  useEffect(() => {
    fetchMorePins()
  }, [])


  const fetchMorePins = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const response = await pinService.getAllPins(cursor)

      if (!cursor) {
        setPins(response.pins)
      } else {
        setPins(prevPins => [...prevPins, ...response.data])
      }

      setCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error('Error fetching pins:', error)
    } finally {
      setLoading(false)
    }
  }

  // Infinite scroll using Intersection Observer
  // Create a mutable ref to store the observer
  const observer = useRef()

  // Create a callback ref for the last pin element
  const lastPinRef = useCallback(node => {
    // Don't observe while loading
    if (loading) return

    // Clean up previous observer
    if (observer.current) observer.current.disconnect()

    // Create new observer
    observer.current = new IntersectionObserver(entries => {
      // When last pin becomes visible AND we have more pins
      if (entries[0].isIntersecting && hasMore) {
        console.log('Loading more pins')
        fetchMorePins() // Load more pins
      }
    })

    // Start observing the last pin
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  return (
    <>
      <Header />
      <Navigation />
      <div className="home-container">
        <div className="pins-grid">
          {pins.map((pin, index) => (
            <div
            // Attach observer to last pin
              key={pin.id}
              ref={index === pins.length - 1 ? lastPinRef : null}
            >
              <PinCard image={pin.image_url} title={pin.title} user={ pin.user } id={pin.id}/>

            </div>
          ))}
        </div>
      </div></>
  )
}

export default PinFeed