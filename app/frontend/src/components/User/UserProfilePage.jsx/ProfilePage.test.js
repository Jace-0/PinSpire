import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfilePage from './ProfilePage'
import { AuthProvider } from '../../../context/AuthContext'
import { UserProvider } from '../../../context/UserContext'
import { NotificationProvider } from '../../../context/NotificationContext'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { userService } from '../../../services/userService'
import * as authHook from '../../../context/AuthContext'


// Mock userService
jest.mock('../../../services/userService', () => ({
  userService: {
    getProfileByUsername: jest.fn(),
    checkFollowStatus: jest.fn()
  }
}))

// Mock useAuth hook
jest.spyOn(authHook, 'useAuth').mockImplementation(() => ({
  user: null // default state - no logged in user
}))

const mockProfile = {
  data: {
    'id': '74fc9af9-9d68-4dea-ba1e-b6227fc88799',
    'username': 'jace0',
    'email': 'jace0@gmail.com',
    'first_name': 'Jace',
    'last_name': 'Sam',
    'dob': '2003-06-10',
    'gender': null,
    'country': null,
    'language': 'en',
    'bio': 'software developer',
    'avatar_url': 'https://res.cloudinary.com/dafezeyjh/image/upload/v1738921818/avatars/defaults/default_jace0_1738921807324.png',
    'website_url': null,
    'location': null,
    'created_at': '2025-02-07T09:50:13.446Z',
    'updated_at': '2025-02-07T09:50:13.446Z',
    'last_login': null,
    'is_verified': false,
    'is_active': true,
    'createdAt': '2025-02-07T09:50:13.446Z',
    'updatedAt': '2025-02-07T09:50:13.446Z',
    'following_count': '0',
    'followers_count': '0'
  }
}

const renderProfilePage = (username = 'jace0', loggedInUser = null) => {
  jest.spyOn(authHook, 'useAuth').mockImplementation(() => ({
    user: loggedInUser
  }))
  return render(
    <MemoryRouter  initialEntries={[`/profile/${username}`]}>
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Routes>
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}


describe('ProfilePage', () => {

  beforeEach(() => {
    //mock response
    userService.getProfileByUsername.mockResolvedValue(mockProfile)
    userService.checkFollowStatus.mockResolvedValue({ isFollowing: false })
  })

  it('shows loading state initially', () => {
    renderProfilePage()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })


  // Displays user profile when viewing own profile
  it('correctly determines if viewing own profile', async () => {
    const loggedInUser = { username: 'jace0' }
    renderProfilePage('jace0', loggedInUser)

    await waitFor(() => {
      expect(userService.getProfileByUsername).toHaveBeenCalledWith('jace0')
    })

    // Verify components are displayed
    expect(screen.getByTestId('header-search')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument()
    expect(screen.getByTestId('logout-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('profileSection-container')).toBeInTheDocument()
    expect(screen.getByTestId('tabs-container')).toBeInTheDocument()

    expect(await screen.findByText('Edit profile')).toBeInTheDocument()
    expect(await screen.findByText('Jace Sam')).toBeInTheDocument()
    expect(await screen.findByText('@jace0')).toBeInTheDocument()
    expect(await screen.findByText('0 followers · 0 following')).toBeInTheDocument()
    expect(await screen.findByText('bio: software developer')).toBeInTheDocument()
    expect(await screen.queryByText ('Follow')).not.toBeInTheDocument()
    expect(await screen.queryByText ('Message')).not.toBeInTheDocument()
    expect(await screen.getByRole('button', { name: 'Created' })).toBeInTheDocument()
    expect(await screen.getByRole('button', { name: 'Liked' })).toBeInTheDocument()

  })



  it('displays user profile when viewing someone else\'s profile', async () => {

    const loggedInUser = { username: 'other_user' }
    renderProfilePage('jace0', loggedInUser)

    await waitFor(() => {
      expect(userService.getProfileByUsername).toHaveBeenCalledWith('jace0')
    })

    // Verify components are displayed
    expect(screen.getByTestId('header-search')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument()
    expect(screen.getByTestId('logout-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('profileSection-container')).toBeInTheDocument()
    expect(screen.getByTestId('tabs-container')).toBeInTheDocument()

    expect(screen.queryByText('Edit profile')).not.toBeInTheDocument()
    expect(await screen.findByText('Jace Sam')).toBeInTheDocument()
    expect(await screen.findByText('@jace0')).toBeInTheDocument()
    expect(await screen.findByText('0 followers · 0 following')).toBeInTheDocument()
    expect(await screen.findByText('bio: software developer')).toBeInTheDocument()
    expect(await screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument()
    expect(await screen.getByRole('button', { name: 'Message' })).toBeInTheDocument()
    expect(await screen.getByRole('button', { name: 'Created' })).toBeInTheDocument()
    expect(await screen.getByRole('button', { name: 'Liked' })).toBeInTheDocument()
  })

  it('displays profile not found when no profile exists', async () => {
    // Mock service to return null
    userService.getProfileByUsername.mockRejectedValue(null)
    renderProfilePage()
    await waitFor(() => {
      expect(screen.getByText('Profile not found')).toBeInTheDocument()
    })
  })

})