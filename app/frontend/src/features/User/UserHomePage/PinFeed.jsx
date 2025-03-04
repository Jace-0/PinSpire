/* eslint-disable react-hooks/exhaustive-deps */
// pages/PinFeed.jsx
import { useEffect, useState, useRef, useCallback } from 'react'
import { pinService } from '../../../services/pinService'
import PinCard from './PinCard'
import Header from '../../../components/common/Header'
import Navigation from '../../../components/common/Navigation'


const PinFeed = () => {
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)


  const fetchMorePins = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const response = await pinService.getAllPins(cursor)
      if (!cursor) {
        setPins(response.pins)
      } else {
        setPins(prevPins => [...prevPins, ...response.pins])
      }

      setCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error('Error fetching pins:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMorePins()
  }, [])

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
        fetchMorePins() // Load more pins
      }
    })

    // Start observing the last pin
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  return (
    <>
      <Navigation />
      <Header />
      <div className="home-container">
        <div className="pins-grid">
          {pins && pins.map((pin, index) => (
            <div
            // Attach observer to last pin
              key={pin.id}
              ref={index === pins.length - 1 ? lastPinRef : null}
            >
              <PinCard pin={pin}/>

            </div>
          ))}
        </div>
      </div></>
  )
}

export default PinFeed