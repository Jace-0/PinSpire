import React, { Suspense } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation
} from 'react-router-dom'

import LoadingSpinner from './components/common/LoadingSpinner'
import { useAuth } from './context/AuthContext'

// Components
import SignupForm from './features/Auth/SignupForm/SignupForm'
import LoginForm from './features/Auth/LoginForm/LoginForm'
import HomePage from './components/Home/HomePage'
import CreatePin from './features/Pins/CreatePin/CreatePin'
import EditProfile from './features/User/UserProfilePage.jsx/EditProfile'
import PinDetails from './features/Pins/PinDetails/PinDetails'
import PinFeed from './features/User/UserHomePage/PinFeed'
import ProfilePage from './features/User/UserProfilePage.jsx/ProfilePage'


const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()


  const ProtectedRoute = () => {
    // Store the attempted URL in session storage during loading
    React.useEffect(() => {
      if (loading) {
        sessionStorage.setItem('lastRoute', location.pathname)
      }
    }, [])

    if (loading) {
      return <LoadingSpinner />
    }
    // Redirect to login if not authenticated or no user
    if (!isAuthenticated) {
      return <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    }

    // If authenticated and there's a stored route, redirect to it
    const lastRoute = sessionStorage.getItem('lastRoute')
    if (lastRoute && location.pathname !== lastRoute) {
      sessionStorage.removeItem('lastRoute')
      return <Navigate to={lastRoute} replace />
    }

    // Render child routes if authenticated
    return <Outlet />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ?(
          <Navigate to={location.state?.from || '/'}  replace />
        ): (
          <LoginForm />
        )
      } />
      <Route path="/signup" element={
        isAuthenticated ? (
          <Navigate to="/" replace />
        ) :(
          <SignupForm />
        )
      } />

      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            {isAuthenticated ? <PinFeed /> : <HomePage />}
          </Suspense>
        }
      />


      {/* Protected routes */}
      <Route element={<ProtectedRoute/>}>
        <Route path="/profile/:username" element={<ProfilePage/>}/>
        <Route path="/settings/profile" element={<EditProfile />} />
        <Route path="/pin-creation-tool" element={<CreatePin />} />
        <Route path="/pin/:id" element={<PinDetails />} />
      </Route>
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