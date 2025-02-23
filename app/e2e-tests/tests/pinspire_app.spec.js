/* eslint-disable no-undef */
import { test, expect } from './test-setup'
const path = require('path')
const { signUpUser, loginUser, signUpNewUser} = require('./helper')

test.describe('Pinspire E2E Test', () => {
  test('Home page can be opened', async ({ page }) => {
    // Header elements
    await expect(page.getByRole('img', { name: 'Pinterest logo' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'About', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Business', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Blog', exact: true })).toBeVisible()
    
    // Auth buttons
    await expect(page.getByRole('link', { name: 'Log in', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign up', exact: true })).toBeVisible()

    // Content elements
    await expect(page.getByRole('heading', { name: 'Save ideas you like on Pinspire' })).toBeVisible()
    await expect(page.getByText('Collect your favorites so you can get back to them later.')).toBeVisible()
    await expect(page.locator('.explore-button')).toBeVisible()

    
    // Image cards
    await expect(page.locator('.card').filter({ hasText: 'Fern future home vibes' })).toBeVisible()
    await expect(page.locator('.card').filter({ hasText: 'My Scandinavian bedroom' })).toBeVisible()
    await expect(page.locator('.card').filter({ hasText: 'The deck of my dreams' })).toBeVisible()
    await expect(page.locator('.card').filter({ hasText: 'Our bathroom' })).toBeVisible()
    await expect(page.locator('.card').filter({ hasText: 'Serve my drinks in style' })).toBeVisible()
  })

  test.describe('Authentication Flow', () => {
    test('user can sign up and login', async ({ page }) => {
      await signUpUser(page)


      // Verify logged in state
      await expect(page.getByTestId('logout-wrapper')).toBeVisible()
      
      // Logout
      await page.getByTestId('logout-wrapper').locator('i').click()
      await page.waitForURL('/')
      
      // Login with same credentials
      await loginUser(page)
      await page.waitForURL('/')

      // Verify logged in state again
      await expect(page.getByTestId('logout-wrapper')).toBeVisible()
    })
  })

  test.describe('Authenticated user tests', () => {
    test.describe('Home Page TEST', () => {
      test('User Home page - TEST component &Links ', async ({ primaryUserPage }) => {
        // Header
        await expect(primaryUserPage.getByRole('textbox', { name: 'Search users' })).toBeVisible()
        await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
        await expect(primaryUserPage.getByRole('link', { name: 'Profile' })).toBeVisible()
        await expect(primaryUserPage.locator('.profile-avatar')).toBeVisible()

        // Check sidebar container
        await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()

        // Check each navigation icon
        await expect(primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-home') })).toBeVisible()
        await expect(primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-bell') })).toBeVisible()
        await expect(primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-plus') })).toBeVisible()
        await expect(primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-comment-dots') })).toBeVisible()
        await expect(primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-user') })).toBeVisible()

        // Test pin feed container
        await expect(primaryUserPage.locator('.home-container')).toBeVisible()

        // Test navigation functionality
        await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-home') }).click()
        await expect(primaryUserPage).toHaveURL('/')

        // Test Notification navigation
        await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-bell') }).click()
        await expect(primaryUserPage.locator('.notification-system')).toBeVisible()
        await expect(primaryUserPage.locator('.notification-header h3')).toBeVisible()
        await expect(primaryUserPage.locator('.notification-content')).toBeVisible()
        await expect(primaryUserPage.getByText('No notifications yet')).toBeVisible()

        // Test pin creation tool navigation
        await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-plus') }).click()
        await expect(primaryUserPage).toHaveURL('/pin-creation-tool')

        // Test Message navigation
        await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-comment-dots') }).click()
        await expect(primaryUserPage.locator('.messaging-system')).toBeVisible()
        await expect(primaryUserPage.locator('.messaging-header')).toBeVisible()
        await expect(primaryUserPage.locator('.messaging-header h3')).toHaveText('Messages')
        
        // Test new Message
        await primaryUserPage.locator('.new-message-btn').click()
        await expect(primaryUserPage.locator('.new-message-container')).toBeVisible()

        await primaryUserPage.locator('.back-button').click()
        await expect(primaryUserPage.locator('.messaging-header')).toBeVisible()
        await expect(primaryUserPage.locator('.messaging-header h3')).toHaveText('Messages')          


        // Test profile navigation (assuming logged in user's username)
        await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-user') }).click()
        await expect(primaryUserPage.url()).toContain('/profile/test')

      })
    
      test('Search Bar works', async ({ userProfilePage }) => {
        const searchBar = primaryUserPage.getByRole('textbox', { name: 'Search users' })
        await expect(searchBar).toBeVisible()
        await expect(userProfilePage.locator('.header-search-bar i ')).toBeVisible()

        await searchBar.click()
        await searchBar.type('test')

        await expect(primaryUserPage.locator('.search-dropdown')).toBeVisible()
        await primaryUserPage.getByTestId('loading-spinner').waitFor({ state: 'visible'})
        await expect(primaryUserPage.locator('.user-search-result')).toBeVisible()
        await expect(primaryUserPage.locator('.user-search-result h3')).toBeVisible()
        await expect(primaryUserPage.locator('.user-search-result h3')).toHaveText('People')
        await expect(primaryUserPage.locator('.user-search-result .user-grid')).toHaveText('People')

        // Test User is Visible
        await expect(primaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
        await expect(primaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
        await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toBeVisible()
        await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@test')

        // Click user , route to profile/test

        await primaryUserPage.locator('.user-card .s-user-info').click()
        await expect(primaryUserPage.url()).toContain('/profile/test')
        await primaryUserPage.waitForLoadState('networkidle')

        // verify componet 
        await expect(userProfilePage.getByTestId('header-search')).toBeVisible()
        await expect(userProfilePage.getByTestId('sidebar-nav')).toBeVisible()
         
 
        await expect(userProfilePage.getByTestId('profileSection-container')).toBeVisible()
        await expect(userProfilePage.locator('.profile-section')).toBeVisible()

      })
      test('can view own profile', async ({ userProfilePage }) => {
        // verify componet 
        await expect(userProfilePage.getByTestId('header-search')).toBeVisible()
        await expect(userProfilePage.getByTestId('sidebar-nav')).toBeVisible()
        

        await expect(userProfilePage.getByTestId('profileSection-container')).toBeVisible()
        await expect(userProfilePage.locator('.profile-section')).toBeVisible()

        // Test User username, following and follow count and profile image 
        await expect(userProfilePage.locator('.profile-section img')).toBeVisible()
  
        // Test username
        await expect(
          userProfilePage.locator('.profile-section p').filter({ hasText: '@test' })
        ).toBeVisible()
        
        // Test followers/following count
        await expect(
          userProfilePage.locator('.profile-section p').filter({ hasText: '0 followers · 0 following' })
        ).toBeVisible()

        //Buttons
        await expect(userProfilePage.getByRole('button', { name: 'Edit profile' })).toBeVisible()
        await expect(userProfilePage.getByRole('button', { name: 'Liked' })).toBeVisible()
        await expect(userProfilePage.getByRole('button', { name: 'Created' })).toBeVisible()

        // verify Tabs has no liked or created pins
        await expect(userProfilePage.getByText('No pins created yet')).toBeVisible()

        await userProfilePage.getByRole('button', { name: 'Liked' }).click()
        await expect(userProfilePage.getByText('No pins liked yet')).toBeVisible()
      })

      // Edit Profile 
      test.describe('Edit Profile Page', () => {
        test('displays all form elements correctly', async ({ primaryUserPage }) => {
          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-user') }).click()
          await expect(primaryUserPage.url()).toContain('/profile/test')

          await primaryUserPage.getByTestId('loading-spinner').waitFor({ state: 'visible', timeout: 5000 })

          // Edit Button 
          await primaryUserPage.getByRole('button', {name: 'Edit profile'}).click()
          await expect(primaryUserPage).toHaveURL('settings/profile')

  
          // Verfiy component are displayed correctly
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
  
          // Verify container
          await expect(primaryUserPage.locator('.edit-profile-container')).toBeVisible()
          await expect(primaryUserPage.getByRole('heading', { name: 'Edit profile' })).toBeVisible()
          await expect(primaryUserPage.getByText('Keep your personal details private. Information you add here is visible to anyone who can view your profile.')).toBeVisible()
  
          // Profile image
          await expect(primaryUserPage.locator('.edit-profile-photo img')).toBeVisible()
          await expect(primaryUserPage.getByRole('button', {name : 'Change'})).toBeVisible()
  
          // Form fields
          const formFields = [
            'First name',
            'Last name',
            'About',
            'Gender',
            'Pronouns',
            'Website',
            'Username'
          ]
  
          for (const field of formFields) {
            await expect(
              primaryUserPage.locator('.form-field').filter({ hasText: field })
            ).toBeVisible()
          }
  
          await expect(primaryUserPage.getByText('Choose up to 2 sets of pronouns')).toBeVisible()
          await expect(primaryUserPage.getByText('Add a link to drive traffic to your site')).toBeVisible()
          await expect(primaryUserPage.getByText('www.pinspire.com/test')).toBeVisible()
        })


        test('can edit profile information', async ({ profileSettingsPage }) => {
          const testData = {
            firstName: 'Jace',
            lastName: 'Sam',
            bio: 'Software developer',
            website: 'https://pinterest-clone.com/'
          }

          // Fill form fields
          await profileSettingsPage.locator('#first_name').type(testData.firstName)
          await profileSettingsPage.locator('#last_name').type(testData.lastName)
          await profileSettingsPage.locator('#bio').type(testData.bio)
          await profileSettingsPage.locator('#website_url').type(testData.website)

          // Select gender
          await profileSettingsPage.locator('#gender').selectOption('male')

          // Submit form
          await profileSettingsPage.locator('.save-button').click()

          // Verify success message
          await profileSettingsPage.getByText('Update successful!').waitFor({ state: 'visible' })

          // Navigate to profile page
          await profileSettingsPage.getByRole('link', { name: 'Profile' }).click()
          await profileSettingsPage.locator('.profile-section').waitFor({ state: 'visible' })

          // Verify updated information
          await expect(
            profileSettingsPage.locator('.profile-section h1')
          ).toHaveText(`${testData.firstName} ${testData.lastName}`)
          
          await expect(
            profileSettingsPage.locator('.profile-section p').filter({ hasText: `bio: ${testData.bio}` })
          ).toBeVisible()
        })

        test('handles profile photo upload', async ({ profileSettingsPage }) => {
          // 1. Get initial image src
          const imageElement = profileSettingsPage.locator('.profile-image')
          const initialSrc = await imageElement.getAttribute('src')

          // 2. Upload new image
          const testImagePath = path.join(__dirname, './test-files/profile.jpeg')
          await profileSettingsPage.locator('.change-photo-btn').click()
          await profileSettingsPage.evaluate(() => {
            document.getElementById('avatar-file').style.display = 'block'
          })
          await profileSettingsPage.locator('#avatar-file').setInputFiles(testImagePath)

          // 3. Wait for upload success message
          await expect(
            profileSettingsPage.getByText('Profile photo updated successfully')
          ).toBeVisible({ timeout: 5000 })

          // 4. Get new src and verify it changed
          const newSrc = imageElement
          await expect(newSrc).toHaveAttribute('src' ) // Verifies src exists
          expect(newSrc).not.toBe(initialSrc) // Verifies src changed
        })

        test('validates file size and type', async ({ profileSettingsPage }) => {
          // On UI only images are allowed to be selected
          // Setup large file mock (>5MB)
          const largePath = path.join(__dirname, './test-files/Shot48.00000.png')

          await profileSettingsPage.locator('.change-photo-btn').click()
          await profileSettingsPage.evaluate(() => {
            document.getElementById('avatar-file').style.display = 'block'
          })
          await profileSettingsPage.locator('#avatar-file').setInputFiles(largePath)
                
          // Verify error message
          await expect(
            profileSettingsPage.getByText('File size too large. Maximum size is 5MB')
          ).toBeVisible()
      
        })
      })

    })

    test.describe('User interation', async () => {
      test.describe('Follow and Following test', async () => {

        let followButton
        test('can follow user - FOLLOW TEST', async ({ primaryUserPage, secondaryUserPage }) => {
          // create new User (Jace)
          await signUpNewUser(secondaryUserPage, 'jace@test.com', 'jace000')
          
          // Go to newly created user page 
          const searchBar = primaryUserPage.getByRole('textbox', { name: 'Search users' })
          await expect(searchBar).toBeVisible()  
          await searchBar.click()
          await searchBar.type('jace')
          await expect(primaryUserPage.locator('.search-dropdown')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-result')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-result .user-grid')).toHaveText('People')
  
          // Jace is Visible
          await expect(primaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@jace')
  
          // Click user 
          await primaryUserPage.locator('.user-card .s-user-info').click()
          await expect(primaryUserPage.url()).toContain('/profile/jace')
          await primaryUserPage.waitForLoadState('networkidle')
  
          //  Verify component
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
  
          // Verify new created profile section
          await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
          await expect(primaryUserPage.locator('.profile-section')).toBeVisible()
          await expect(primaryUserPage.getByText('@jace0')).toBeVisible()
          await expect(primaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
          await expect(primaryUserPage.getByRole('button',{ name: 'Message'})).toBeVisible()
          await expect(primaryUserPage.getByText('0 followers · 0 following')).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Liked' })).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Created' })).toBeVisible()
          
  
          // Follow user 
          // Click the follow button
          followButton = primaryUserPage.locator('.follow-btn')
          await followButton.click()


          // Success Alert
          await expect(primaryUserPage.getByRole('alert')
            .filter({ hasText: 'Successfully followed jace' }))
            .toBeVisible({ timeout: 5000 })

          // Verify button state changed
          await expect(followButton).toHaveText('Following', { timeout: 5000 })

          // await expect(primaryUserPage.getByRole('button', { name: 'Follow' }))
          //   .toBeHidden({ timeout: 5000 })

          // Wait for Follow button to disappear and Following to appear
          // await primaryUserPage
          //   .locator('.follow-btn').not.toHaveText('Follow')

          // Verify UI updates
          await expect(primaryUserPage.getByRole('button', { name: 'Following'})).toBeVisible({ timeout: 5000 })
          // verify (Jace)  has one Followers
          await expect(primaryUserPage.getByText('1 followers · 0 following')).toBeVisible({ timeout: 5000 })

  
          // await expect(primaryUserPage.getByText('0 followers · 0 following' )).not.toBeVisible()
  
  
          // verify (test user) following count is 1
          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-user') }).click()
          await expect(primaryUserPage.url()).toContain('/profile/test')
  
          await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
  
          await expect(primaryUserPage.getByText('0 followers · 1 following')).toBeVisible()
        })

        test('can Unfollow - UNFOLLOW TEST', async ({ primaryUserPage, secondaryUserPage }) => {

          // verify previous follow
          const searchBar = primaryUserPage.getByRole('textbox', { name: 'Search users' })
          await expect(searchBar).toBeVisible()  
          await searchBar.click()
          await searchBar.type('jace')
          await expect(primaryUserPage.locator('.search-dropdown')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-result')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-result .user-grid')).toHaveText('People')
  
          // Jace is Visible
          await expect(primaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@jace')
  
          // Click user 
          await primaryUserPage.locator('.user-card .s-user-info').click()
          await expect(primaryUserPage.url()).toContain('/profile/jace')
          await primaryUserPage.waitForLoadState('networkidle')

          await primaryUserPage.locator('.profile-section').waitFor({ state: 'visible' })
  
          await expect(primaryUserPage.getByText('@jace')).toBeVisible()
          await expect(primaryUserPage.getByRole('button',{ name: 'Following'})).toBeVisible()
          await expect(primaryUserPage.getByRole('button',{ name: 'Message'})).toBeVisible()
          await expect(primaryUserPage.getByText('1 followers · 0 following')).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Liked' })).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Created' })).toBeVisible()
  
  
          // Unfollow user (Jace)
          followButton = primaryUserPage.locator('.follow-btn')
          await followButton.click()

          // Success Alert
          await expect(primaryUserPage.getByRole('alert')
            .filter({ hasText: 'Successfully unfollowed jace' }))
            .toBeVisible({ timeout: 5000 })
        
          // Verify button state changed
          await expect(followButton).toHaveText('Follow', { timeout: 5000 })
        
          await expect(primaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
  
          // verify following
          await expect(primaryUserPage.getByText('0 followers · 0 following')).toBeVisible()
  
          // verify secondaryUserPage following count is 0
          await secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-user') }).click()
          await expect(secondaryUserPage.url()).toContain('/profile/jace')
  
          await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
  
          await expect(primaryUserPage.getByText('0 followers · 0 following')).toBeVisible()
        })

        test('can both follow and unfollow each other - FOLLOW, UNFOLLOW TEST', async ({ primaryUserPage, secondaryUserPage}) => {
          // primary user follows secondary user
          let searchBar = primaryUserPage.getByRole('textbox', { name: 'Search users' })
          await expect(searchBar).toBeVisible()  
          await searchBar.click()
          await searchBar.type('jace')
          await expect(primaryUserPage.locator('.search-dropdown')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-result')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-result .user-grid')).toHaveText('People')
  
          // Jace is Visible
          await expect(primaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@jace')
  
          // Click user 
          await primaryUserPage.locator('.user-card .s-user-info').click()
          await expect(primaryUserPage.url()).toContain('/profile/jace')
          await primaryUserPage.waitForLoadState('networkidle')

          await primaryUserPage.locator('.profile-section').waitFor({ state: 'visible' })
  
          await expect(primaryUserPage.getByText('@jace')).toBeVisible()
          await expect(primaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
          await expect(primaryUserPage.getByText('0 followers · 0 following')).toBeVisible()
  
  
          // Follow user (Jace)
          followButton = primaryUserPage.locator('.follow-btn')
          await followButton.click()

          // Success Alert
          await expect(primaryUserPage.getByRole('alert')
            .filter({ hasText: 'Successfully followed jace' }))
            .toBeVisible({ timeout: 5000 })
        
          // Verify button state changed
          await expect(followButton).toHaveText('Following', { timeout: 5000 })
        
          await expect(primaryUserPage.getByRole('button',{ name: 'Following'})).toBeVisible()
  
          // verify following count is 1
          await expect(primaryUserPage.getByText('1 followers · 0 following')).toBeVisible()
  
          // verify secondaryUserPage following count is 1
          await secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-user') }).click()
          await expect(secondaryUserPage.url()).toContain('/profile/jace')
  
          await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
          await expect(primaryUserPage.getByText('@jace')).toBeVisible()
          await expect(primaryUserPage.getByText('1 followers · 0 following')).toBeVisible()

          // Secodary User Follows Primary User (test)
          searchBar = secondaryUserPage.getByRole('textbox', { name: 'Search users' })
          await expect(searchBar).toBeVisible()  
          await searchBar.click()
          await searchBar.type('test')
          await expect(secondaryUserPage.locator('.search-dropdown')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-search-result')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-search-result .user-grid')).toHaveText('People')
  
          // Test is Visible
          await expect(secondaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-card .s-user-info .s-username')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@test')
  
          // Click user 
          await secondaryUserPage.locator('.user-card .s-user-info').click()
          await expect(secondaryUserPage.url()).toContain('/profile/jace')
          await secondaryUserPage.waitForLoadState('networkidle')

          await secondaryUserPage.locator('.profile-section').waitFor({ state: 'visible' })
  
          await expect(secondaryUserPage.getByText('@test')).toBeVisible()
          await expect(secondaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
          await expect(secondaryUserPage.getByText('0 followers · 1 following')).toBeVisible()
  
          followButton = secondaryUserPage.locator('.follow-btn')
          await followButton.click()

          // Success Alert
          await expect(secondaryUserPage.getByRole('alert')
            .filter({ hasText: 'Successfully followed test' }))
            .toBeVisible({ timeout: 5000 })
        
          // Verify button state changed
          await expect(followButton).toHaveText('Following', { timeout: 5000 })
        
          await expect(secondaryUserPage.getByRole('button',{ name: 'Following'})).toBeVisible()
  
          // verify (@test) following count is 1,  followers count is 1
          await expect(secondaryUserPage.getByText('1 followers · 1 following')).toBeVisible()
  
          // verify primaryUserPage (test) Followers count is 1 and following is 1
          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-user') }).click()
          await expect(primaryUserPage.url()).toContain('/profile/test')
  
          await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
          await expect(primaryUserPage.getByText('@test')).toBeVisible()
          await expect(primaryUserPage.getByText('1 followers · 1 following')).toBeVisible()


          // BOTH UNFOLLOWS

          // PRIMARYUSER (test) unfollows SECONDARYUSER (jace)
          // verify previous follow
          searchBar = primaryUserPage.getByRole('textbox', { name: 'Search users' })
          await expect(searchBar).toBeVisible()  
          await searchBar.click()
          await searchBar.type('jace')
          await expect(primaryUserPage.locator('.search-dropdown')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-result')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-result .user-grid')).toHaveText('People')
  
          // Jace is Visible
          await expect(primaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@jace')
  
          // Click user 
          await primaryUserPage.locator('.user-card .s-user-info').click()
          await expect(primaryUserPage.url()).toContain('/profile/jace')
          await primaryUserPage.waitForLoadState('networkidle')
 
          await primaryUserPage.locator('.profile-section').waitFor({ state: 'visible' })
          await expect(primaryUserPage.getByText('@jace')).toBeVisible()
          await expect(primaryUserPage.getByRole('button',{ name: 'Following'})).toBeVisible()
          await expect(primaryUserPage.getByText('1 followers · 1 following')).toBeVisible()
   
          // UNFOLLOW USER (Jace)
          followButton = primaryUserPage.locator('.follow-btn')
          await followButton.click()
 
          // Success Alert
          await expect(primaryUserPage.getByRole('alert')
            .filter({ hasText: 'Successfully unfollowed jace' }))
            .toBeVisible({ timeout: 5000 })
         
          // Verify button state changed
          await expect(followButton).toHaveText('Follow', { timeout: 5000 })
         
          await expect(primaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
   
          // verify (jace) followers count is 0 and following count is 1(test)
          await expect(primaryUserPage.getByText('0 followers · 1 following')).toBeVisible()
   

          // SECONDARYUSER (jace) unfollows PRIMARYUSER (test)
          // UNFOLLOW PRIMARY USER (test)
          searchBar = secondaryUserPage.getByRole('textbox', { name: 'Search users' })
          await expect(searchBar).toBeVisible()  
          await searchBar.click()
          await searchBar.type('test')
          await expect(secondaryUserPage.locator('.search-dropdown')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-search-result')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-search-result .user-grid')).toHaveText('People')
  
          // Jace is Visible
          await expect(secondaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-card .s-user-info .s-username')).toBeVisible()
          await expect(secondaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@test')
  
          // Click user 
          await primaryUserPage.locator('.user-card .s-user-info').click()
          await expect(primaryUserPage.url()).toContain('/profile/test')
          await primaryUserPage.waitForLoadState('networkidle')
 
          await secondaryUserPage.locator('.profile-section').waitFor({ state: 'visible' })
          await expect(secondaryUserPage.getByText('@test')).toBeVisible()
          await expect(secondaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
          // verify followers count is 1 (jace), following is 0 (previous unfollowed jace)
          await expect(secondaryUserPage.getByText('1 followers · 0 following')).toBeVisible()

          followButton = secondaryUserPage.locator('.follow-btn')
          await followButton.click()
 
          // Success Alert
          await expect(secondaryUserPage.getByRole('alert')
            .filter({ hasText: 'Successfully unfollowed test' }))
            .toBeVisible({ timeout: 5000 })
         
          // Verify button state changed
          await expect(followButton).toHaveText('Follow', { timeout: 5000 })
         
          await expect(secondaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
   
          // verify folowers count is 0 and 
          await expect(secondaryUserPage.getByText('0 followers · 0 following')).toBeVisible()
        })  
      })

      test.describe('Message test ', async () => {
        test('displays all Message elements correctly', async ({ primaryUserPage }) => {

          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-comment-dots') }).click()
          await expect(primaryUserPage.locator('.messaging-system')).toBeVisible()
          await expect(primaryUserPage.locator('.messaging-header')).toBeVisible()
          await expect(primaryUserPage.locator('.messaging-header h3')).toHaveText('Messages')
          
          // empty message state
          await expect(primaryUserPage.locator('.empty-state')).toBeVisible()
          await expect(primaryUserPage.locator('.empty-title')).toHaveText('No messages yet')

          // Test new message 
          await expect(primaryUserPage.locator('.new-message-btn')).toBeVisible()
          await expect(primaryUserPage.locator('.new-message-btn i')).toBeVisible() // fas icon
          await expect(primaryUserPage.locator('.new-message-btn span')).toHaveText('New message')

        }),

        test('displays New message Page elements correctly', async ({ primaryUserPage}) => {
          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-comment-dots') }).click()
          // Click new message button
          await primaryUserPage.locator('.new-message-btn').click()

          await expect(primaryUserPage.locator('.new-message-container')).toBeVisible()
          await expect(primaryUserPage.locator('.messaging-header')).toHaveText('New Message')

          await expect(primaryUserPage.locator('.back-button .fa-arrow-left')).toBeVisible()

          await expect(primaryUserPage.locator('.search-container')).toBeVisible()
          await expect(primaryUserPage.getByRole('textbox', { name: 'Find by username' })).toBeVisible()
          await expect(primaryUserPage.locator('.search-container i')).toBeVisible()
          await expect(primaryUserPage.locator('.search-container h3')).toHaveText('No result found')
        }),

        test('should support user search, chat creation, and real-time messaging', async ({ primaryUserPage, secondaryUserPage, newMessagePage }) => {
          // Create secondary test user
          await signUpNewUser(secondaryUserPage, 'jace@test.com', 'jace000')

          // Search for user
          const searchInput = await newMessagePage.getByRole('textbox', { name: 'Find by username' })
          await searchInput.type('jace', { delay: 100 })
          await expect(searchInput).toHaveValue('jace')

          // Verify search results
          await primaryUserPage.getByTestId('loading-spinner').waitFor({ state: 'visible' })
          await expect(primaryUserPage.getByText('People')).toBeVisible()
          await expect(primaryUserPage.locator('.search-results')).toBeVisible()
          await expect(primaryUserPage.locator('.search-result-item .result-avatar')).toBeVisible()
          await expect(primaryUserPage.locator('.search-result-item .result-info .result-username')).toHaveText('@jace')
      

          // Initialize chat
          await primaryUserPage.getByText('@jace').click()
          await expect(primaryUserPage.locator('.chat-system')).toBeVisible()
          await expect(primaryUserPage.locator('.chat-header')).toBeVisible()
          await expect(primaryUserPage.locator('.messages-container')).toBeVisible()
          await expect(primaryUserPage.locator('.chat-footer input')).toBeVisible()
          await expect(primaryUserPage.locator('.chat-footer .send-button')).toBeDisabled()
      
          // Primary user sends message
          const initialMessage = 'Hey! I heard Playwright is great for E2E testing. What do you think?'
          await primaryUserPage.locator('.message-input').type(initialMessage)
          await primaryUserPage.getByRole('button', { name: 'Send' }).click()
      
          // Verify message delivery
          await expect(primaryUserPage.locator('.messages-container .message-wrapper.sent')).toBeVisible({ timeout: 5000 })
          await expect(primaryUserPage.locator('.message-wrapper.sent .message-bubble .message-content')).toHaveText(initialMessage)

          await expect(primaryUserPage.locator('.message-wrapper.sent .message-bubble .message-time')).toBeVisible()

          // Secondary user receives and responds
          await secondaryUserPage.getByRole('link')
            .filter({ has: secondaryUserPage.locator('i.fas.fa-comment-dots') })
            .click()
  
          await expect(secondaryUserPage.locator('.messaging-system')).toBeVisible()
          await expect(secondaryUserPage.getByText('No messages yet')).not.toBeVisible()
          await expect(secondaryUserPage.locator('.chat-content .chat-details .chat-username')).toHaveText('test')
          await expect(secondaryUserPage.getByText(initialMessage)).toBeVisible()

          // Open chat and send reply
          await secondaryUserPage.locator('.chat-content').click()
          const replyMessage = 'Absolutely! The async handling and real-time testing capabilities are impressive.'
          await secondaryUserPage.locator('.message-input').type(replyMessage)
          await secondaryUserPage.getByRole('button', { name: 'Send' }).click()



          await expect(primaryUserPage.locator('.message-wrapper.sent .message-bubble .message-time')).toBeVisible()

          // Verify reply delivery
          await expect(secondaryUserPage.locator('.messages-container .message-wrapper.sent')).toBeVisible({ timeout: 5000 })
          await expect(secondaryUserPage.locator('.message-wrapper.sent .message-bubble .message-content')).toHaveText(replyMessage)

          // Verify primary user receives reply
          await primaryUserPage.getByText(replyMessage).waitFor({ state: 'visible' })
        })

      })
      test.describe('Pin Creation Tool Page - Test pin can be created and visble', async () => {
        test(' Pin creation page element and components are render completely', async ({ primaryUserPage}) => {

          // Navigate to pin creation
          await expect(primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-plus') })).toBeVisible()
          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-plus') }).click()
          await expect(primaryUserPage).toHaveURL('/pin-creation-tool')

          // Header section verification
          const header = primaryUserPage.locator('.create-pin-header')
          await expect(header).toBeVisible()
          await expect(header.locator('h1')).toHaveText('Create Pin')
          await expect(header.locator('.publish-button')).toBeVisible()

          // Side nav verification
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()

          // Pin creation tool container
          await expect(primaryUserPage.locator('.content-container')).toBeVisible()

          // Image upload section verification
          const imageSection = {
            container: primaryUserPage.locator('.image-section'),
            wrapper: primaryUserPage.locator('.image-wrapper'),
            fileInput: primaryUserPage.getByTestId('file-input'),
            uploadContainer: primaryUserPage.locator('.upload-container'),
            primaryText: primaryUserPage.locator('.upload-container .primary-text'),
            secondaryText: primaryUserPage.locator('.upload-container .secondary-text'),
            explorerButton: primaryUserPage.locator('.explorer-button')
          }
          
          // Verify image section elements
          await expect(imageSection.container).toBeVisible()
          await expect(imageSection.wrapper).toBeVisible()
          await expect(imageSection.fileInput).toBeHidden()
          await expect(imageSection.uploadContainer).toBeVisible()
          await expect(imageSection.primaryText).toHaveText('Choose a file or drag and drop it here')
          await expect(imageSection.secondaryText).toHaveText('We recommend using high quality .jpg files less than 20MB')
          await expect(imageSection.explorerButton).toBeVisible()
          await expect(imageSection.explorerButton).toHaveText('Open Explorer')

          // Form section verification
          const formSection = primaryUserPage.locator('.form-section')
          await expect(formSection).toBeVisible()


          // Form fields
          const formFields = [
            'Title',
            'Description',
            'Link',
            'Board',
            'Tagged Topics',
            'Add products',
            'More options'
          ]
            
          for (const field of formFields) {
            await expect(
              primaryUserPage.locator('.form-group').filter({ hasText: field })
            ).toBeVisible()
          }

          // Verify helper text for tagged topics
          await expect(formSection
            .locator('.helper-text'))
            .toHaveText('Don\'t worry, people won\'t see your tags')

          // Verify more options button has icon
          await expect(formSection
            .locator('.more-options-button i.fas.fa-chevron-down'))
            .toBeVisible()
    
        }),

        test('can create pin with image upload and details', async ({ primaryUserPage, createPinPage }) => {

          const testImagePath = path.join(__dirname, './test-files/jacket.jpeg')
          const pinDetails = {
            title: 'Black winter jacket',
            description: 'Premium black titanium winter jacket featuring water-resistant material, ' + 
                        'thermal insulation, and sleek modern design. Perfect for extreme weather ' +
                        'conditions while maintaining a sophisticated urban look.',
            link: 'https://pinspire.com/black-winter-jacket',
            imagePath: testImagePath
          }
        
          // Upload image
          const fileInput = createPinPage.getByTestId('file-input')
          await fileInput.setInputFiles(pinDetails.imagePath)
        
          // Verify image preview
          await expect(createPinPage.locator('.pin-image')).toBeVisible()
          await expect(createPinPage.locator('.edit-button')).toBeVisible()
        
          // Fill pin details
          await createPinPage.locator('#title').type(pinDetails.title)
          await createPinPage.locator('#description').type(pinDetails.description)
          await createPinPage.locator('#link').type(pinDetails.link)

          // Board Functionality doesnt exist yet

          // Verify publish button becomes enabled
          const publishButton = createPinPage.locator('.publish-button')        
          // Submit pin
          await publishButton.click()
        
          await expect(primaryUserPage.getByRole('alert')
            .filter({ hasText: 'Pin created successfully' }))
            .toBeVisible({ timeout: 8000 })
        
          // Verify redirect to pin detail page
          await expect(createPinPage).toHaveURL('/')
          await primaryUserPage.waitForLoadState('networkidle')
        
          // Verify pin appears on home page
          await expect(primaryUserPage.getByText(pinDetails.title)).toBeVisible()
        })

        test('Pin can be viewed with all detials', async ({ primaryUserPage, createPinPage }) => {
          /*
          // SINGLE TEST
          const testImagePath = path.join(__dirname, './test-files/jacket.jpeg')
          const pinDetails = {
            title: 'Black winter jacket',
            description: 'Premium black winter jacket featuring water-resistant material, thermal insulation, and sleek modern design. Perfect for extreme weather conditions while maintaining a sophisticated urban look.',
            link: 'https://pinspire.com/black-winter-jacket',
            imagePath: testImagePath
          }
        
          // Upload image
          const fileInput = createPinPage.getByTestId('file-input')
          await fileInput.setInputFiles(pinDetails.imagePath)
        
          // Verify image preview
          await expect(createPinPage.locator('.pin-image')).toBeVisible()
          await expect(createPinPage.locator('.edit-button')).toBeVisible()
        
          // Fill pin details
          await createPinPage.locator('#title').fill(pinDetails.title)
          await createPinPage.locator('#description').fill(pinDetails.description)
          await createPinPage.locator('#link').fill(pinDetails.link)

          // Board Functionality doesnt exist yet

          // Verify publish button becomes enabled
          const publishButton = createPinPage.locator('.publish-button')        
          // Submit pin
          await publishButton.click()
        
          await expect(primaryUserPage.getByRole('alert')
            .filter({ hasText: 'Pin created successfully' }))
            .toBeVisible({ timeout: 8000 })
        
          // Verify redirect to pin detail page
          await expect(createPinPage).toHaveURL('/')
          await primaryUserPage.waitForLoadState('networkidle')
*/


          // Verify Created Pin is in home Pinfeed



          // Pin feed home container
          await expect(primaryUserPage.locator('.home-container')).toBeVisible()

          // Verify Created Pin is live
          await expect(primaryUserPage.locator('.pins-grid')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-card')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-card .pin-image-container')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-image-container .pin-image')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-image-container .pin-overlay .pin-title')).toHaveText('Black winter jacket')

          // Verify user info
          await expect(primaryUserPage.locator('.pin-card .pin-footer')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-card .pin-footer .user-avatar')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-card .pin-footer .user-name')).toBeVisible()

          // click on image 
          await primaryUserPage.locator('.pin-image-container .pin-image').click()

          // More specific regex pattern to match UUID format
          await expect(primaryUserPage.url()).toMatch(/\/pin\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)
          // await expect(primaryUserPage.url()).toContain('/pin/')

          await primaryUserPage.getByTestId('loading-spinner').waitFor({ state: 'visible', timeout: 5000 })

          // verify component
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()

          await expect(primaryUserPage.locator('.pin-details-container')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-details-container .pin-details-wrapper')).toBeVisible()

          // PIN IMAGE SECTION
          await expect(primaryUserPage.locator('.pin-details-image-section .pin-main-image')).toBeVisible()

          // PIN CONTENT SECTION
          await expect(primaryUserPage.locator('.pin-details-content')).toBeVisible()
          
          // verify user info
          await expect(primaryUserPage.locator('.user-info-container .user-details')).toBeVisible()
          await expect(primaryUserPage.locator('.user-details .profile-image')).toBeVisible()
          await expect(primaryUserPage.locator('.user-details .user-username')).toBeVisible()
          await expect(primaryUserPage.locator('.user-details .user-username')).toHaveText('test')

          // Verify Like button
          await expect(primaryUserPage.locator('.user-info-container .like-container')).toBeVisible()
          await expect(primaryUserPage.locator('.like-container .pin-like-button')).toBeVisible()
          await expect(primaryUserPage.locator('.like-container .like-count')).toHaveText('0')

          // Verify Pin info
          await expect(primaryUserPage.locator('.pin-info')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-info .pin-title-pin')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-info .pin-title-pin')).toHaveText('Black winter jacket')

          const descriptionLocator = primaryUserPage.locator('.pin-info .pin-description')
          await expect(descriptionLocator).toBeVisible()

          const fullDescription = 'Premium black winter jacket featuring water-resistant material, thermal insulation, and sleek modern design. Perfect for extreme weather conditions while maintaining a sophisticated urban look.'
        
          await expect(descriptionLocator).toContainText(fullDescription.substring(0, 100))
          await expect(primaryUserPage.locator('button:has-text("Show more")')).toBeVisible()

          // Click show more
          await primaryUserPage.click('button:has-text("Show more")')
    
          // Verify full description is shown with show less
          await expect(descriptionLocator).toContainText(fullDescription)
          await expect(primaryUserPage.locator('button:has-text("Show less")')).toBeVisible()
    
          // Click show less
          await primaryUserPage.click('button:has-text("Show less")')
    
          // Verify back to truncated state
          await expect(descriptionLocator).toContainText(fullDescription.substring(0, 100))
          await expect(primaryUserPage.locator('button:has-text("Show more")')).toBeVisible()
          

          // Verify Comments section
          await expect(primaryUserPage.locator('.pin-comments-section')).toBeVisible()

          await expect(primaryUserPage.locator('.pin-comments-section .comments-header')).toBeVisible()
          await expect(primaryUserPage.locator('.comments-header .comments-count')).toBeVisible()
          await expect(primaryUserPage.locator('.comments-header .comments-count')).toHaveText('0 comments')

          await expect(primaryUserPage.locator('.comments-header .comments-toggle')).toBeVisible()

          // PinCommentsList
          // await expect(primaryUserPage.locator('.pin-comments-list')).toBeVisible()


          // PinCommentInput
          await expect(primaryUserPage.locator('.pin-comment-input-wrapper')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()

          await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-submit')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-submit i')).toBeVisible()


        })

        test('Pin owner Can Like own pin - No Like Notification', async ({ pinPage }) => {
          // Like Previously created pin
          await expect(pinPage.locator('.user-info-container .like-container')).toBeVisible()
          await expect(pinPage.locator('.like-container .pin-like-button')).toBeVisible()
          await expect(pinPage.locator('.like-container .like-count')).toHaveText('0')

          await pinPage.locator('.like-container .pin-like-button').click()

          await expect(pinPage.locator('.like-container .like-count')).toHaveText('1', {
            timeout: 5000,
            waitFor: 'visible'
          })

          await expect(pinPage.locator('.like-container .like-count')).not.toHaveText('0')
        })
        test('Pin owner Can Unlike own pin - No Like Notification', async ({ pinPage }) => {
          // Like Previously created pin
          await expect(pinPage.locator('.user-info-container .like-container')).toBeVisible()
          await expect(pinPage.locator('.like-container .pin-like-button')).toBeVisible()
          await expect(pinPage.locator('.like-container .like-count')).toHaveText('1')

          await pinPage.locator('.like-container .pin-like-button').click()

          await expect(pinPage.locator('.like-container .like-count')).toHaveText('0', {
            timeout: 5000,
            waitFor: 'visible'
          })

          await expect(pinPage.locator('.like-container .like-count')).not.toHaveText('1')

          // VERIFY NO LIKE NOTIFICATION 

          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()

        })

        test('Pin owner Can Comment on own pin - No Comment Notification', async ({ pinPage }) => {
          const commentCountHeader = pinPage.locator('.comments-header .comments-count')

          await expect(commentCountHeader).toHaveText('0 comments')
          await expect(pinPage.locator('.pin-comment-input-wrapper')).toBeVisible()
          await expect(pinPage.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(pinPage.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(pinPage.locator('.pin-comment-input-wrapper .pin-comment-submit')).toBeVisible()


          // Comment on own pin
          const commentInput = pinPage.locator('.pin-comment-input')
          await commentInput.type('I love it!')
          await expect(commentInput).toHaveValue('I love it!')

          await pinPage.locator('.pin-comment-submit').click()

          await expect(commentCountHeader).toHaveText('1 comments')

          // Comment header toggle down
          await pinPage.locator('.comments-toggle i').click()

          await expect(pinPage.locator('.pin-comments-list')).toBeVisible()

          //  Verify User
          await expect(pinPage.locator('.pin-comment')).toBeVisible()
          await expect(pinPage.locator('.pin-comment .comment-main')).toBeVisible()
          await expect(pinPage.locator('.comment-main .comment-user-avatar')).toBeVisible()
          await expect(pinPage.locator('.comment-main .comment-content')).toBeVisible()
          await expect(pinPage.locator('.comment-content .comment-username')).toHaveText('test')
  
          // Verify comment
          await expect(pinPage.locator('.comment-content .comment-text')).toHaveText('I love it!')

          // Verify comment actions
          await expect(pinPage.locator('.comment-actions')).toBeVisible()
          // verify comment time
          await expect(pinPage.locator('.comment-actions .comment-time')).toBeVisible()

          // verify Comment Reply is visible
          await expect(pinPage.locator('.comment-actions .reply-button')).toBeVisible()
    
          // Verify Like Comment 
          await expect(pinPage.locator('.comment-actions .like-button')).toBeVisible()

          // VERIFY NO COMMENT NOTIFICATION
          
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()
        })

        test('Like Own Comment - No Like Comment Notification', async ({ pinPage}) => {

          await expect(pinPage.locator('.pin-comment-input')).toHaveText('1 comments')
          await pinPage.locator('.comments-toggle i').click()
          await expect(pinPage.locator('.comment-content .comment-username')).toHaveText('test')
          await expect(pinPage.locator('.comment-content .comment-text')).toHaveText('I love it!')
    
          // Like Comment 
          await expect(pinPage.locator('.comment-actions .like-button')).toBeVisible()

          await pinPage.locator('.comment-actions .like-button').click()

          // Like count should be 
          await expect(pinPage.locator('.comment-actions .like-count')).toHaveText('1', {
            timeout: 5000,
            waitFor: 'visible'
          })
        })

        test('pin owner Can reply to own comment - No Comment Reply Notification', async ({ pinPage }) => {
          // Verify Pin Page
          await expect(pinPage.locator('.pin-details-container')).toBeVisible()
          await expect(pinPage.locator('.pin-details-image-section .pin-main-image')).toBeVisible()
          await expect(pinPage.locator('.pin-details-content')).toBeVisible()
          await expect(pinPage.locator('.pin-details-content .user-info-container')).toBeVisible()
          await expect(pinPage.locator('.pin-info .pin-title-pin')).toHaveText('Black winter jacket')

          // Verify Initial Comment State 
          await expect(pinPage.locator('.pin-comment-input')).toHaveText('1 comments')
          await pinPage.locator('.comments-toggle i').click()
          await expect(pinPage.locator('.comment-content .comment-username')).toHaveText('test')
          await expect(pinPage.locator('.comment-content .comment-text')).toHaveText('I love it!')

          // Verify Reply Interface
          await expect(pinPage.locator('.comment-actions .reply-button')).toBeVisible()
          await pinPage.locator('.comment-actions .reply-button').toBeVisible()
          await expect(pinPage.locator('.reply-input-container')).toBeVisible()
          await expect(pinPage.locator('.reply-input-container .reply-input')).toBeVisible()
          await expect(pinPage.locator('.reply-input-container .reply-submit')).toBeVisible()
          await expect(pinPage.locator('.reply-input-container .reply-submit i')).toBeVisible()

          // Submit Reply
          await pinPage.locator('.comment-actions .reply-button').click()
          await pinPage.locator('.reply-input-container .reply-input').type('Replying to my own comment')
          await expect(commentInput).toHaveValue('Replying to my own comment')

          await pinPage.locator('.reply-input-container .reply-submit i').click()

          // Verify Reply Content
          await expect(pinPage.getByText('1 reply')).toBeVisible({ timeout: 5000})
          await expect(pinPage.locator('.replies-section')).toBeVisible({ timeout: 5000})
          await pinPage.locator('.replies-section button i').click()

          await expect(pinPage.locator('.replies-container .show')).toBeVisible()

          //  Verify User
          await expect(pinPage.locator('.replies-container .show .pin-comment')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .pin-comment .comment-main')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .comment-main .comment-user-avatar')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .comment-main .comment-content')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .comment-content .comment-username')).toHaveText('test')

          await expect(pinPage.locator('.replies-container .show .comment-content .comment-text')).toHaveText('Replying to my own comment')

          // Verify Reply Actions
          await expect(pinPage.locator('.replies-container .show .comment-actions')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .comment-actions .comment-time')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .comment-actions .reply-button')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .comment-actions .like-button')).toBeVisible()

          // VERIFY NO REPLY COMMENT NOTIFICATION
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()

        })


        test('Pin can be liked - TEST LIKE NOTIFICATION IN REAL-TIME', async ({pinPage, pinPageWithSecondaryUser }) => {
          // Liking primary User pin
          await expect(pinPageWithSecondaryUser.locator('.user-info-container .like-container')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.like-container .pin-like-button')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.like-container .like-count')).toHaveText('1')

          await pinPageWithSecondaryUser.locator('.like-container .pin-like-button').click()

          await expect(pinPage.locator('.like-container .like-count')).toHaveText('2', {
            timeout: 5000,
            waitFor: 'visible'
          })
          await expect(pinPageWithSecondaryUser.locator('.like-container .like-count')).not.toHaveText('1')

          // VERIFY PRIMARY USER RECIEVED LIKE NOTIFICATION FROM (JACE)
          // pinPage is primary user page
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).not.toBeVisible()

          // Verify Notication


        })

        test('can Comment on pin - TEST LIKE NOTIFICATION IN REAL-TIME', async ({ pinPage, pinPageWithSecondaryUser }) => {
          // Comment on primary User pin (test)

          const commentCountHeader = pinPageWithSecondaryUser.locator('.comments-header .comments-count')

          await expect(commentCountHeader).toHaveText('1 comments')
          await expect(pinPageWithSecondaryUser.locator('.pin-comment-input-wrapper')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-comment-input-wrapper .pin-comment-submit')).toBeVisible()

          // Comment on pin
          const commentInput = pinPageWithSecondaryUser.locator('.pin-comment-input')
          const jaceComment = 'Love the white fur collar'
          await commentInput.type(jaceComment)
          await expect(commentInput).toHaveValue(jaceComment)

          await pinPageWithSecondaryUser.locator('.pin-comment-submit').click()

          await expect(commentCountHeader).toHaveText('2 comments')

          // Comment header toggle down
          await pinPageWithSecondaryUser.locator('.comments-toggle i').click()

          await expect(pinPageWithSecondaryUser.locator('.pin-comments-list')).toBeVisible()

          //  Verify User
          await expect(pinPageWithSecondaryUser.locator('.pin-comment')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-comment .comment-main')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.comment-main .comment-user-avatar')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.comment-main .comment-content')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.comment-content .comment-username').filter({ hasText: 'jace' })).toBeVisible()


          // Verify previous own comment
          await expect(pinPageWithSecondaryUser.locator('.comment-content .comment-text').filter({ hasText: 'I love it!' })).toBeVisible()

          // Verify comment
          await expect(pinPageWithSecondaryUser.locator('.comment-content .comment-text').filter({ hasText: jaceComment })).toBeVisible()

          // Fix
          // verify comment time
          // await expect(pinPage.locator('.comment-actions .comment-time')).toBeVisible()

          // // verify Comment Reply is visible
          // await expect(pinPage.locator('.comment-actions .reply-button')).toBeVisible()
              
          // // Verify Like Comment 
          // await expect(pinPage.locator('.comment-actions .like-button')).toBeVisible()

          // VERIFY NO COMMENT NOTIFICATION
          
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()


        })
        test('Can reply to Comments - TEST COMMENT NOTIFICATION IN REAL-TIME', async  ({ pinPage, pinPageWithSecondaryUser}) => {
          // Reply primary User commment previous comment

          // Verify Pin Page
          await expect(pinPageWithSecondaryUser.locator('.pin-details-container')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-details-image-section .pin-main-image')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-details-content')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-details-content .user-info-container')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-info .pin-title-pin')).toHaveText('Black winter jacket')

          // Verify Initial Comment State 
          await expect(pinPage.locator('.pin-comment-input')).toHaveText('2 comments')
          await pinPage.locator('.comments-toggle i').click()
          await expect(pinPageWithSecondaryUser.locator('.comment-content .comment-username').filter({ hasText: 'test' })).toBeVisible()

          await expect(pinPage.locator('.comment-content .comment-text').filter({ hasText: 'I love it!' })).toBeVisible()

          // Verify Reply Interface
          await expect(pinPage.locator('.comment-actions .reply-button')).toBeVisible()

          await pinPage.locator('.comment-actions .reply-button').click()

          // previous own reply
          await expect(pinPageWithSecondaryUser.getByText('Replying to my own comment')).toBeVisible()

          // Submit Reply

          const JaceReplyComment = 'Paywright dev teams are awesome for creating a good a piece of software for e2e testing'
          await pinPage.locator(JaceReplyComment)
          await expect(commentInput).toHaveValue(JaceReplyComment)

          await pinPage.locator('.reply-input-container .reply-submit i').click()

          // Verify Reply Content
          await expect(pinPage.getByText('2 replies')).toBeVisible({ timeout: 5000})
          await expect(pinPage.locator('.replies-section')).toBeVisible({ timeout: 5000})
          await pinPage.locator('.replies-section button i').click()

          await expect(pinPage.locator('.replies-container .show')).toBeVisible()

          //  Verify User
          await expect(pinPage.locator('.replies-container .show .pin-comment')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .pin-comment .comment-main')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .comment-main .comment-content')).toBeVisible()
          await expect(pinPage.locator('.replies-container .show .comment-content .comment-username').filter({ hasText: 'jace' })).toBeVisible()

          await expect(pinPage.locator('.replies-container .show .comment-content .comment-text').filter({ hasText: jaceComment })).toBeVisible()


          
          // VERIFY NO REPLY COMMENT NOTIFICATION
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()
        })
      })
    })
  })
})
