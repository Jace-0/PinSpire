import React from 'react'
import SignupForm from './components/auth/SignupForm/SignupForm'
import LoginForm from './components/auth/LoginForm/LoginForm'
import HomePage from './components/Home/HomePage'
import CreatePin from './components/pins/CreatePin/CreatePin'
import EditProfile from './components/User/UserProfilePage.jsx/EditProfile'
import PinDetails from './components/pins/PinDetails/PinDetails'
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



const AppRoutes = () => {
  const { user } = useAuth()
  const userData = {
    name: 'Jace Sam',
    username: 'jacesam0',
    followingCount: 2,
    profileImage: 'https://storage.googleapis.com/a1aa/image/guR6S4VOgGrvIReIavThKwp5wccDdkmGFRlWCrn3IR4uMDAKA.jpg',
    onShare: () => console.log('Share profile'),
    onEditProfile: () => console.log('Edit profile')
  }
  console.log('User', user)

  return (
    <Routes>
      <Route path="/" element={user ? <PinFeed/> : <HomePage/>} />
      <Route path="/login" element={<LoginForm/>} />
      <Route path="/signup" element={<SignupForm/>} />
      <Route
        path='/:username'
        element={
          user ? (
            <ProfilePage
              userData={userData}
              onSearch={(e) => console.log(e.target.value)}
              activeTab="saved"
              onTabChange={(tab) => console.log(`Switching to ${tab} tab`)}
            />
          ) : (
            <Navigate to="/" replace />
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

// const App = () => {
//   const navigate = useNavigate()
//   const userData = {
//     name: 'Jace Sam',
//     username: 'jacesam0',
//     followingCount: 2,
//     profileImage: 'https://storage.googleapis.com/a1aa/image/guR6S4VOgGrvIReIavThKwp5wccDdkmGFRlWCrn3IR4uMDAKA.jpg',
//     onShare: () => console.log('Share profile'),
//     onEditProfile: () => console.log('Edit profile')
//   }
//   const { user } = useAuth()

//   return(
//     <div>
//       <Router>
//         {/* <SignupForm/>
//       <LoginForm/> */}
//         {/* <ProfilePage
//           userData={userData}
//           onSearch={(e) => console.log(e.target.value)}
//           activeTab="saved"
//           onTabChange={(tab) => console.log(`Switching to ${tab} tab`)}
//         /> */}
//         {/* <HomePage/> */}

//         {/* <CreatePin/> */}
//         {/* <EditProfile/> */}
//         {/* <PinDetails /> */}
//         {/* <PinFeed /> */}


//         <Routes>
//           <Route path="/" element={user ? <PinFeed/> :<HomePage/>} />
//           <Route path="/login" element={<LoginForm/>} />
//           <Route path="/signup" element={<SignupForm/>} />
//           <Route path="/profile" element={user ? <ProfilePage
//             userData={userData}
//             onSearch={(e) => console.log(e.target.value)}
//             activeTab="saved"
//             onTabChange={(tab) => console.log(`Switching to ${tab} tab`)}
//           /> : navigate('/')}  />
//           <Route path="/create" element={<CreatePin/>} />

//         </Routes>
//       </Router>
//     </div>
//   )
// }




// export default App
