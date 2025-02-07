import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../../common/Header'
import Navigation from '../../common/Navigation'
import ProfileSection from './ProfileSection'
import Tabs from './Tabs'
import { useAuth } from '../../../context/AuthContext'
import { UserCnxt } from '../../../context/UserContext'
import { userService } from '../../../services/userService'
import LoadingSpinner from '../../common/LoadingSpinner'

const ProfilePage = ({ onSearch }) => {
  const navigate = useNavigate()
  const { user: loggedInUser } = useAuth()
  const { profile, setProfile } = UserCnxt()
  const { username } = useParams()
  // const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)


  const fetchProfile = React.useCallback(async () => {
    try {
      const profileData = await userService.getProfileByUsername(username)
      setProfile(profileData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [username, setProfile]) // username is the only dependency needed


  const updateUserProfile = React.useCallback(async () => {
    try {
      const profileData = await userService.getProfileByUsername(username)
      setProfile(profileData)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }, [username, setProfile])

  React.useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (loading) return <LoadingSpinner/>
  if (!profile) return <div>Profile not found</div>

  // This determines if we're viewing our own profile
  const isOwnProfile = loggedInUser?.username === username



  return (
    <div className="layout">
      <Header onSearch={onSearch} />
      <Navigation />
      <div className="container" data-testId="profileSection-container">
        <ProfileSection  isOwnProfile={isOwnProfile} profile={profile} updateProfile={updateUserProfile} />
        <Tabs />
      </div>
    </div>
  )
}

export default ProfilePage