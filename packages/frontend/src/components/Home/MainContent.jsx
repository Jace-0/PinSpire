import { useEffect } from 'react'
const MainContent = () => {
  useEffect(() => {
    document.body.className = 'home-page'

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.className = ''
    }
  }, [])
  return (
    <div className="main-content">
      <div className="left">
        <h1>Save ideas you like on PinSpire</h1>
        <p>Collect your favorites so you can get back to them later.</p>
        <a class="explore-button" href="#">
          Explore</a>
      </div>
      <div class="right">
        <div class="card">
          <img alt="Fern future home vibes" height="200" src="https://storage.googleapis.com/a1aa/image/0cnQcu4kT2YIDdz9BKhqMfeffByfmJQlqYT3EPg3XU74ZiBgC.jpg" width="150"/>
          <div class="overlay">
            Fern future home vibes
          </div>
        </div>
        <div class="card">
          <img alt="My Scandinavian bedroom" height="200" src="https://storage.googleapis.com/a1aa/image/GJo8iIkVd541N5OJ5hvrkW9jCEx6utgSCovxeeeNm3QimYAoA.jpg" width="150"/>
          <div class="overlay">
            My Scandinavian bedroom
          </div>
        </div>
        <div class="card">
          <img alt="The deck of my dreams" height="200" src="https://storage.googleapis.com/a1aa/image/oeYFG313mlxDJirggkAUAs1XFz3E5ZImIXO0fTU2cuCTTMAUA.jpg" width="150"/>
          <div class="overlay">
            The deck of my dreams
          </div>
        </div>
        <div class="card">
          <img alt="Serve my drinks in style" height="200" src="https://storage.googleapis.com/a1aa/image/Bfs3P7rChg39EaMteidXa6BKQZGy1NiXwGrMPVaiY8fomYAoA.jpg" width="150"/>
          <div class="overlay">
            Serve my drinks in style
          </div>
        </div>
        <div class="card">
          <img alt="Our bathroom" height="200" src="https://storage.googleapis.com/a1aa/image/hbiNFebZq02kciBGOaSD8QGyFg7pgcNNujd4xy74rqLrJGAKA.jpg" width="150"/>
          <div class="overlay">
            Our bathroom
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainContent