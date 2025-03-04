import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Header from '../../../components/common/Header'
import Navigation from '../../../components/common/Navigation'
import ProfileSection from './ProfileSection'
import Tabs from './Tabs'

import { useAuth } from '../../../context/AuthContext'
import { UserCnxt } from '../../../context/UserContext'
import { userService } from '../../../services/userService'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const ProfilePage = () => {
  const { user: loggedInUser } = useAuth()
  const { profile, setProfile } = UserCnxt()
  const { username } = useParams()
  // const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)


  const fetchProfile = React.useCallback(async () => {
    try {
      const profileData = await userService.getProfileByUsername(username)
      setProfile(profileData.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [username, setProfile]) // username is the only dependency needed


  React.useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (loading) return <LoadingSpinner/>
  if (!profile) return <div>Profile not found</div>

  // This determines if we're viewing our own profile
  const isOwnProfile = loggedInUser?.username === username



  return (
    <div className="layout">
      <Navigation />
      <Header/>
      <div className="u-home-container" data-testid="profileSection-container">
        <ProfileSection  isOwnProfile={isOwnProfile} profile={profile} updateProfile={fetchProfile} />
        <Tabs />
      </div>
    </div>
  )
}

export default ProfilePage