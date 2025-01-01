import React from 'react'
import { useState } from 'react'
import Header from '../../common/Header'
import Navigation from '../../common/Navigation'
import ProfileSection from './ProfileSection'
import Tabs from './Tabs'
import { useAuth } from '../../../context/AuthContext'
import { userService } from '../../../services/userService'

const ProfilePage = ({ userData, onSearch, activeTab, onTabChange }) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)


  const fetchProfile = async () => {
    try {
      const profile = await userService.getProfile(user.id)
      setProfile(profile)
    }catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchProfile()
  }, [])


  if (loading) return <div>Loading...</div>
  console.log('userData', profile)

  return (
    <div className="layout">
      <Header onSearch={onSearch} />
      <Navigation />
      <div className="container">
        <ProfileSection user={userData} />
        <Tabs activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}

export default ProfilePage