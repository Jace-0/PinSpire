import React from 'react'
import SignupForm from './components/auth/SignupForm/SignupForm'
import LoginForm from './components/auth/LoginForm/LoginForm'
import Sidebar from './components/common/Sidebar'
import HomePage from './components/Home/HomePage'
import CreatePin from './components/pins/CreatePin/CreatePin'
import EditProfile from './components/User/UserProfilePage.jsx/EditProfile'
import PinDetails from './components/pins/PinDetails/PinDetails'
import UserHomePage from './components/User/UserHomePage/UserHomePage'
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

const App = () => {
  const userData = {
    name: 'Jace Sam',
    username: 'jacesam0',
    followingCount: 2,
    profileImage: 'https://storage.googleapis.com/a1aa/image/guR6S4VOgGrvIReIavThKwp5wccDdkmGFRlWCrn3IR4uMDAKA.jpg',
    onShare: () => console.log('Share profile'),
    onEditProfile: () => console.log('Edit profile')
  }
  const { user } = useAuth()

  return(
    <div>
      <Router>
        {/* <SignupForm/>
      <LoginForm/> */}
        {/* <Sidebar
          userData={userData}
          onSearch={(e) => console.log(e.target.value)}
          activeTab="saved"
          onTabChange={(tab) => console.log(`Switching to ${tab} tab`)}
        /> */}
        {/* <HomePage/> */}

        {/* <CreatePin/> */}
        {/* <EditProfile/> */}
        {/* <PinDetails /> */}
        {/* <UserHomePage /> */}


        <Routes>
          <Route path="/" element={user ? <UserHomePage/> :<HomePage/>} />
          <Route path="/login" element={<LoginForm/>} />
          <Route path="/signup" element={<SignupForm/>} />

        </Routes>
      </Router>
    </div>
  )
}




export default App
