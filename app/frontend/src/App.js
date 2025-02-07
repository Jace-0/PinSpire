import React from 'react'
import SignupForm from './features/Auth/SignupForm/SignupForm'
import LoginForm from './features/Auth/LoginForm/LoginForm'
import HomePage from './components/Home/HomePage'
import CreatePin from './features/Pins/CreatePin/CreatePin'
import EditProfile from './components/User/UserProfilePage.jsx/EditProfile'
import PinDetails from './features/Pins/PinDetails/PinDetails'
import PinFeed from './components/User/UserHomePage/PinFeed'
import ProfilePage from './components/User/UserProfilePage.jsx/ProfilePage'
import { useAuth } from './context/AuthContext'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useParams,
  useNavigate,
  useMatch
} from 'react-router-dom'

import LoadingSpinner from './components/common/LoadingSpinner'
// import NotificationSystem from './features/notification/NotificationSystem'

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner/>

  return (
    <Routes>
      <Route path="/" element={ user ? ( <PinFeed /> ) : ( <HomePage />)}/>
      <Route path="/login" element={<LoginForm/>} />
      <Route path="/signup" element={<SignupForm/>} />
      <Route
        path='/profile/:username'
        element={
          loading ? (
            <LoadingSpinner/>
          ) : (
            <ProfilePage
              onSearch={(e) => console.log(e.target.value)}
              activeTab="saved"
              onTabChange={(tab) => console.log(`Switching to ${tab} tab`)}
            />
          )
        }
      />
      <Route path="/settings/profile" element={<EditProfile/>} />
      <Route path="/pin-creation-tool" element={<CreatePin/>} />
      <Route path="/pin/:id" element={<PinDetails/>} />
    </Routes>
  )
}

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App