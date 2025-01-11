import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../../common/Header'
import Navigation from '../../common/Navigation'
import ProfileSection from './ProfileSection'
import Tabs from './Tabs'
import { useAuth } from '../../../context/AuthContext'
import { userService } from '../../../services/userService'
import LoadingSpinner from '../../common/LoadingSpinner'

const ProfilePage = ({ onSearch, activeTab, onTabChange }) => {
  const navigate = useNavigate()
  const { user: loggedInUser } = useAuth()
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)




  const fetchProfile = async () => {
    try {
      const profileData = await userService.getProfileByUsername(username)
      setProfile(profileData)
    }catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async () => {
    try {
      const profileData = await userService.getProfileByUsername(username)
      setProfile(profileData)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  React.useEffect(() => {
    fetchProfile()
  }, [username]) // Re-fetch when username changes


  if (loading) return <LoadingSpinner/>
  if (!profile) return <div>Profile not found</div>

  console.log('Params ', username)
  // This determines if we're viewing our own profile
  const isOwnProfile = loggedInUser?.username === username



  return (
    <div className="layout">
      <Header onSearch={onSearch} />
      <Navigation />
      <div className="container">
        <ProfileSection  isOwnProfile={isOwnProfile} profile={profile} updateProfile={updateUserProfile} />
        <Tabs activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}

export default ProfilePage