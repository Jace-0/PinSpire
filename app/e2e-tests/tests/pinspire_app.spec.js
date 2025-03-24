/* eslint-disable no-undef */

/* TEST NOTE:
These tests are intentionally not isolated from each other. They run in sequence and depend on the state created by previous tests. This approach was chosen to avoid cleaning up the database between each test, which improves test execution speed. However, this means:

1. Tests must be run in the specified order
2. Test failures may cascade (a failure in an early test may cause later tests to fail)
3. Debugging individual tests may require running preceding tests first

TODO: Consider refactoring to use isolated tests with proper setup/teardown if test maintenance becomes difficult.
*/


import { test, expect } from './test-setup'
const path = require('path')
const { signUpUser, loginUser} = require('./helper')

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

  test.describe('Authentication', () => {

    test.afterAll(async ({ request }) => {
      // Reset DB and create test user
      const response = await request.post('http://localhost:3000/api/test/reset', {
        timeout: 30000, // 30 seconds
        failOnStatusCode: true
      })
      
      if (response.status() !==200){
        throw new Error(`Database reset failed with status ${response.status()}`)
      }
    })
    
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

  test.describe('Authenticated User TEST', () => {
    test.describe('Authenticated Home Page', () => {
      test('User Home page - TEST component & Links ', async ({ primaryUserPage }) => {
        // Header
        await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
        await expect(primaryUserPage.getByRole('textbox', { name: 'Search users' })).toBeVisible()
        await expect(primaryUserPage.locator('.header-search-bar i ')).toBeVisible()
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
        
        await expect(primaryUserPage.locator('.home-container .pins-grid')).toBeHidden() // no pins yet

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
        await primaryUserPage.getByTestId('loading-spinner').waitFor({ state: 'visible'})
        await primaryUserPage.waitForLoadState('networkidle')

        // verify componet 
        await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
        await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
         
 
        await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
        await expect(primaryUserPage.locator('.profile-section')).toBeVisible()

        
        // Test User username, following and follow count and profile image 
        await expect(primaryUserPage.locator('.profile-section img')).toBeVisible()
  
        // Test username
        await expect(
          primaryUserPage.locator('.profile-section p').filter({ hasText: '@test' })
        ).toBeVisible()

      })
    
      test('Search Bar works - TEST (view own profile)', async ({ primaryUserPage }) => {
        await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
        const searchBar = primaryUserPage.getByRole('textbox', { name: 'Search users' })
        await expect(searchBar).toBeVisible()
        await expect(primaryUserPage.locator('.header-search-bar i ')).toBeVisible()

        await searchBar.click()
        await searchBar.type('test')

        // await primaryUserPage.getByTestId('loading-spinner').waitFor({ state: 'visible'})
        await expect(primaryUserPage.locator('.search-dropdown')).toBeVisible()
        await expect(primaryUserPage.getByText('No users found')).toBeVisible() // Expect no users to be found fetch users after 100ms debounce
        await expect(primaryUserPage.locator('.user-search-results')).toBeVisible()
        await expect(primaryUserPage.locator('.user-search-results h3')).toBeVisible()
        await expect(primaryUserPage.locator('.user-search-results h3')).toHaveText('People')
        await expect(primaryUserPage.locator('.user-search-results .user-grid')).toBeVisible()
        await expect(primaryUserPage.locator('.user-search-results .user-grid .user-card')).toBeVisible()

        // Test User is Visible
        await expect(primaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
        await expect(primaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
        await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toBeVisible()
        await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@test')

        // Click user (test) , route to profile/test
        await primaryUserPage.locator('.user-card .s-user-info').click()
        await expect(primaryUserPage.url()).toContain('/profile/test')
        await primaryUserPage.waitForLoadState('networkidle')

        // VERIFY ALL COMPONENT
        await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
        await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
         
 
        await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
        await expect(primaryUserPage.locator('.profile-section')).toBeVisible()

        // Test User username, following and follow count and profile image 
        await expect(primaryUserPage.locator('.profile-section img')).toBeVisible()
  
        // Test username
        await expect(
          primaryUserPage.locator('.profile-section p').filter({ hasText: '@test' })
        ).toBeVisible()
        
        // Test followers/following count
        await expect(
          primaryUserPage.locator('.profile-section p').filter({ hasText: '0 followers · 0 following' })
        ).toBeVisible()

        //Buttons
        await expect(primaryUserPage.getByRole('button', { name: 'Edit profile' })).toBeVisible()
        // Tab Navigation
        await expect(primaryUserPage.locator('.tab-navigation')).toBeVisible()

        await expect(primaryUserPage.getByRole('button', { name: 'Liked' })).toBeVisible()
        await expect(primaryUserPage.getByRole('button', { name: 'Created' })).toBeVisible()
        await expect(primaryUserPage.getByRole('button', { name: 'Board' })).toBeVisible()

        // Verify Tabs has no created pins, liked pins or board
        // Default Created Tab
        await expect(primaryUserPage.getByText('Your Created Pins')).toBeVisible()
        await expect(primaryUserPage.getByText('No pins created yet')).toBeVisible()

        // Like Tab
        await primaryUserPage.getByRole('button', { name: 'Liked' }).click()
        await expect(primaryUserPage.getByText('Your Liked Pins')).toBeVisible()
        await expect(primaryUserPage.getByText('No pins liked yet')).toBeVisible()

        // Board Tab
        await primaryUserPage.getByRole('button', { name: 'Board' }).click()
        await expect(primaryUserPage.getByText('Your saved ideas')).toBeVisible()
        await expect(primaryUserPage.locator('.create-board-button i')).toBeVisible()
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
            firstName: 'Pinspire',
            lastName: 'Test',
            bio: 'Pinterest Clone',
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
          await profileSettingsPage.getByText('Profile photo updated successfully').waitFor({ state: 'visible'})

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

    test.describe('User interaction - WebSocket Test', async () => {
      test.describe('Follow and Following test', async () => {
        let followButton
        test('should Follow target user & and target users recieves a follow Notification', async ({ primaryUserPage, secondaryUserPage }) => {          
          // Go to newly created user page 
          const searchBar = primaryUserPage.getByRole('textbox', { name: 'Search users' })
          await expect(searchBar).toBeVisible()  
          await searchBar.click()
          await searchBar.type('jace')
          await expect(primaryUserPage.locator('.search-dropdown')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-results h3')).toHaveText('People')
    
          // Jace is Visible
          await expect(primaryUserPage.locator('.user-card .s-user-avatar')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info')).toBeVisible()
          await expect(primaryUserPage.locator('.user-card .s-user-info .s-username')).toHaveText('@jace')
  
          // Click user 
          await primaryUserPage.locator('.user-card .s-user-info').click()
          await expect(primaryUserPage.url()).toContain('/profile/jace')
          await primaryUserPage.waitForLoadState('networkidle')
  
          //  Verify component
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
          await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
  
          // Verify new created profile section
          await expect(primaryUserPage.locator('.profile-section')).toBeVisible()
          await expect(primaryUserPage.getByText('@jace0')).toBeVisible()
          await expect(primaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
          await expect(primaryUserPage.getByRole('button',{ name: 'Message'})).toBeVisible()
          await expect(primaryUserPage.getByText('0 followers · 0 following')).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Liked' })).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Created' })).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Board' })).toBeVisible()
          
          // Click the follow button
          followButton = primaryUserPage.locator('.follow-btn')
          await followButton.click()

          // Verify button state changed
          await expect(followButton).toHaveText('Following', { timeout: 5000 })
          await expect(primaryUserPage.getByRole('button', { name: 'Following'})).toBeVisible()

          // verify (Jace) has one Follower
          await expect(primaryUserPage.getByText('1 followers · 0 following')).toBeVisible()
  
          // verify (test User) following count is 1
          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-user') }).click()
          await expect(primaryUserPage.url()).toContain('/profile/test')
          await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
          await expect(primaryUserPage.getByText('0 followers · 1 following')).toBeVisible()

          // Verify Jace recieved Follow notification and Folowers count is 1 
          await expect(secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-bell') })).toBeVisible()
          await expect(secondaryUserPage.locator('.notification-badge')).toHaveText('1')
          await secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-bell') }).click()
          await expect(secondaryUserPage.locator('.notification-system')).toBeVisible()
          await expect(secondaryUserPage.locator('.notification-header h3')).toBeVisible()
          await expect(secondaryUserPage.locator('.notification-content')).toBeVisible()
          await expect(secondaryUserPage.getByText('No notifications yet')).not.toBeVisible()
          await expect(secondaryUserPage.getByText('test started Following you')).toBeVisible()
          await expect(secondaryUserPage.locator('.notification-time')).toBeVisible()

        })

        test('should Unfollow previous followed (jace) and no notification sent', async ({ primaryUserPage, secondaryUserPage }) => {
          // verify previous follow
          const searchBar = primaryUserPage.getByRole('textbox', { name: 'Search users' })
          await expect(searchBar).toBeVisible()  
          await searchBar.click()
          await searchBar.type('jace')
          await expect(primaryUserPage.locator('.search-dropdown')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-results')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-results h3')).toHaveText('People')
          await expect(primaryUserPage.locator('.user-search-results .user-grid')).toBeVisible()
          await expect(primaryUserPage.locator('.user-search-results .user-grid .user-card')).toBeVisible()
  
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

          // Verify button state changed
          await expect(followButton).toHaveText('Follow', { timeout: 5000 })
          await expect(primaryUserPage.getByRole('button',{ name: 'Follow'})).toBeVisible()
  
          // verify profile state
          await expect(primaryUserPage.getByText('0 followers · 0 following')).toBeVisible()
  
          // verify secondaryUserPage following count is 0
          await secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-user') }).click()
          await expect(secondaryUserPage.url()).toContain('/profile/jace')
          await expect(secondaryUserPage.getByTestId('profileSection-container')).toBeVisible()
          await expect(secondaryUserPage.getByText('0 followers · 0 following')).toBeVisible()

          // Veriy No Notification was sent
          await expect(secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-bell') })).toBeVisible()
          await expect(secondaryUserPage.locator('.notification-badge')).toBeHidden()
          await secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-bell') }).click()
          await expect(secondaryUserPage.locator('.notification-system')).toBeVisible()
          await expect(secondaryUserPage.locator('.notification-header h3')).toBeVisible()
          await expect(secondaryUserPage.locator('.notification-content')).toBeVisible()
          await expect(secondaryUserPage.getByText('No notifications yet')).toBeVisible()

        })
      })

      test.describe('Message test ', async () => {
        test('displays all Message elements and components correctly', async ({ primaryUserPage }) => {

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

        test('displays (New message Page) elements and component correctly', async ({ primaryUserPage}) => {
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

        test('Search for users, create chat and be able to send and receive messages real-time messaging', async ({ secondaryUserPage, primaryUserPage }) => {

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

          // Search for user
          const searchInput = await primaryUserPage.getByRole('textbox', { name: 'Find by username' })
          await searchInput.type('jace')
          await expect(searchInput).toHaveValue('jace')
        
          // Verify search results
          await expect(primaryUserPage.getByText('People')).toBeVisible()
          await expect(primaryUserPage.locator('.search-results')).toBeVisible()
          await expect(primaryUserPage.locator('.search-result-item .result-avatar')).toBeVisible()
          await expect(primaryUserPage.locator('.search-result-item .result-info .result-username')).toHaveText('@jace')
              
        
          // Initialize chat
          await primaryUserPage.locator('div').filter({ hasText: /^null null@jace$/ }).first().click()
          await expect(primaryUserPage.locator('.chat-system')).toBeVisible()
          await expect(primaryUserPage.locator('.chat-header')).toBeVisible()
          await expect(primaryUserPage.locator('.messages-container')).toBeVisible()
          await expect(primaryUserPage.locator('.chat-footer input')).toBeVisible()
          await expect(primaryUserPage.locator('.chat-footer .send-button')).toBeDisabled()
              
          // Primary user sends message
          const initialMessage = 'Hey! I heard Playwright is great for E2E testing. What do you think?'
          await primaryUserPage.locator('.message-input').click()
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
        
          // Open chat and send a reply
          await secondaryUserPage.locator('.chat-content').click()
          const replyMessage = 'Absolutely! The async handling and real-time testing capabilities are impressive.'
          await secondaryUserPage.locator('.message-input').fill(replyMessage)
          await expect(secondaryUserPage.locator('.message-input')).toHaveValue(replyMessage)
          await expect(secondaryUserPage.getByRole('button', { name: 'Send' })).not.toBeDisabled()
          await secondaryUserPage.getByRole('button', { name: 'Send' }).click()
        
          await expect(primaryUserPage.locator('.message-wrapper.sent .message-bubble .message-time')).toBeVisible()
        
          // Verify reply delivery
          await expect(secondaryUserPage.locator('.messages-container .message-wrapper.sent')).toBeVisible({ timeout: 5000 })
          await expect(secondaryUserPage.locator('.message-wrapper.sent .message-bubble .message-content')).toHaveText(replyMessage)
        
          // Verify primary user receives reply
          await primaryUserPage.getByText(replyMessage).waitFor({ state: 'visible' })
        })
      })
      
      test.describe('Pin Creation Tool Page', async () => {
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

          await primaryUserPage.locator('.selected-board i').click()
          await expect(primaryUserPage.locator('.no-boards')).toBeVisible()
          // eslint-disable-next-line quotes
          await expect(primaryUserPage.locator('.no-boards p')).toHaveText("You don't have any boards yet.")

          await expect(primaryUserPage.locator('.create-board-btn')).toBeVisible()
          // Verify helper text for tagged topics
          await expect(formSection
            .locator('.helper-text'))
            .toHaveText('Don\'t worry, people won\'t see your tags')

          // Verify more options button has icon
          await expect(formSection
            .locator('.more-options-button i.fas.fa-chevron-down'))
            .toBeVisible()
    
        })

        test('Create pin with image upload and details - NOT ADDED TO BOARD', async ({ createPinPage }) => {

          const testImagePath = path.join(__dirname, './test-files/Jacket.jpeg')
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
          await createPinPage.locator('#title').type(pinDetails.title)
          await createPinPage.locator('#description').type(pinDetails.description)
          await createPinPage.locator('#link').type(pinDetails.link)

          // Verify publish button becomes enabled
          const publishButton = createPinPage.locator('.publish-button')        
          // Submit pin
          await publishButton.click()
        
          await createPinPage.getByRole('alert').filter({ hasText: 'Pin created successfully' }).waitFor({ state: 'visible' })
        
          // Verify redirect to pin detail page
          await expect(createPinPage).toHaveURL('/')
          await createPinPage.waitForLoadState('networkidle')
        
          // Verify pin appears on home page
          await expect(createPinPage.getByText(pinDetails.title)).toBeVisible()
        })

        test('Pin can be viewed with all detials', async ({ primaryUserPage }) => {
          /* Verify Created Pin is in home Pinfeed */
          // verify component
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
          await expect(primaryUserPage.locator('.home-container')).toBeVisible()

          // Verify Created Pin is live
          await expect(primaryUserPage.locator('.home-container .pins-grid')).toBeVisible()
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

          // verify Pin Details Page component
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-details-container')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-details-container .pin-details-wrapper')).toBeVisible()

          // PIN IMAGE SECTION
          await expect(primaryUserPage.locator('.pin-details-image-section .pin-main-image')).toBeVisible()

          // PIN CONTENT SECTION
          await expect(primaryUserPage.locator('.pin-details-content')).toBeVisible()

          // Verify Like button
          await expect(primaryUserPage.locator('.pin-actions .like-container button')).toBeVisible()
          await expect(primaryUserPage.locator('.like-container .like-count')).toHaveText('0')

          // Verify download button 
          await expect(primaryUserPage.locator('.pin-actions .download-action button')).toBeVisible()
          
          // Verify Save to Board 
          await expect(primaryUserPage.locator('.pin-actions .saved-pin')).toBeVisible()
          await expect(primaryUserPage.locator('.board-selector-p i')).toBeVisible()
          await expect(primaryUserPage.locator('.board-selector-p button')).toBeVisible()
          
          // verify user info
          await expect(primaryUserPage.locator('.user-info-container .user-details')).toBeVisible()
          await expect(primaryUserPage.locator('.user-details .profile-image')).toBeVisible()
          await expect(primaryUserPage.locator('.user-details .user-username')).toBeVisible()
          await expect(primaryUserPage.locator('.user-details .user-username')).toHaveText('test')

          // Verify Pin info
          await expect(primaryUserPage.locator('.pin-info')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-info .pin-title-pin')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-info .pin-title-pin')).toHaveText('Black winter jacket')
          const descriptionLocator = primaryUserPage.locator('.pin-info .pin-description')
          await expect(descriptionLocator).toBeVisible()
          const fullDescription = 'Premium black winter jacket featuring water-resistant material, thermal insulation, and sleek modern design. Perfect for extreme weather conditions while maintaining a sophisticated urban look.'
          await expect(descriptionLocator).toContainText(fullDescription.substring(0, 100)+ '...Show more')
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

          // PinCommentInput
          await expect(primaryUserPage.locator('.pin-comment-input-wrapper')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-submit')).toBeVisible()
          await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-submit i')).toBeVisible()
        })

        test('Pin can be added to board', async ({ primaryUserPage }) => {
          /* View Pin, and Added Pin to Fashion Board */
          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-home') }).click()

          // verify component
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
          await expect(primaryUserPage.locator('.home-container')).toBeVisible()

          // Verify Created Pin is live
          await expect(primaryUserPage.locator('.home-container .pins-grid')).toBeVisible()
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
          await expect(primaryUserPage.locator('.pin-actions .like-container button')).toBeVisible()
          await expect(primaryUserPage.locator('.like-container .like-count')).toHaveText('0')

          // Verify download button 
          await expect(primaryUserPage.locator('.pin-actions .download-action button')).toBeVisible()
          
          // Verify Save to Board 
          await expect(primaryUserPage.locator('.pin-actions .saved-pin')).toBeVisible()
          await expect(primaryUserPage.locator('.board-selector-p i')).toBeVisible()
          await expect(primaryUserPage.locator('.board-selector-p button')).toBeVisible()

          // Verify save board, dropdown 
          await expect(primaryUserPage.locator('.saved-pin')).toBeVisible()
          const boardDropdown = primaryUserPage.locator('.board-selector-p i')
          await expect(boardDropdown).toBeVisible()
          await expect(primaryUserPage.locator('.board-selector-p button')).toBeVisible()
          await boardDropdown.click()

          /* Create board and added pin to board */ 
          // eslint-disable-next-line quotes
          await expect(primaryUserPage.locator('.no-boards-p p')).toHaveText("You don't have any boards yet.")
          await expect(primaryUserPage.locator('.create-board-btn-p')).toHaveText('Create board')
          await expect(primaryUserPage.locator('.no-boards-p .create-board-btn-p i')).toBeVisible()
          await primaryUserPage.locator('.create-board-btn-p').click()

          // Create a board 
          await expect(primaryUserPage.locator('.modal-content')).toBeVisible()
          await expect(primaryUserPage.getByText('Create new board')).toBeVisible()
          await expect(primaryUserPage.getByText('Board name')).toBeVisible()
          await primaryUserPage.getByRole('textbox', { name: 'Board name' }).fill('Winter Fashion')

          await expect(primaryUserPage.locator('.modal-actions')).toBeVisible()
          await expect(primaryUserPage.locator('.cancel-button')).toBeVisible()
          const saveButton = primaryUserPage.locator('.save-button-b')
          await expect(saveButton).toBeVisible()
          await saveButton.click()

          // Click the board dropdownn option and select the created board
          await boardDropdown.click()
          await primaryUserPage.locator('.board-option-p ').waitFor({ state: 'visible'})
          await expect(primaryUserPage.getByAltText('Winter Fashion')).toBeVisible()
          await expect(primaryUserPage.locator('span').filter({ hasText: 'Winter Fashion' })).toBeVisible()
          await expect(primaryUserPage.locator('.board-option-p  .pin-count-p')).toBeVisible()
          await primaryUserPage.locator('span').filter({ hasText: 'Winter Fashion' }).click()
          await expect(primaryUserPage.getByText('Pin saved to board successfully')).toBeVisible()


          // Verify Board is saved to Board
          await primaryUserPage.getByRole('link').filter({ has: primaryUserPage.locator('i.fas.fa-user') }).click()
          await expect(primaryUserPage.url()).toContain('/profile/test')
          await primaryUserPage.getByTestId('loading-spinner').waitFor({ state: 'visible'})
          await primaryUserPage.waitForLoadState('networkidle')
  
          // verify componet 
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
          await expect(primaryUserPage.getByTestId('profileSection-container')).toBeVisible()
          await expect(primaryUserPage.locator('.profile-section')).toBeVisible()

          // Tab Navigation
          await expect(primaryUserPage.locator('.tab-navigation')).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Liked' })).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Created' })).toBeVisible()
          await expect(primaryUserPage.getByRole('button', { name: 'Board' })).toBeVisible()

          // Default Created Tab
          await expect(primaryUserPage.getByText('Your Created Pins')).toBeVisible()
          await expect(primaryUserPage.getByText('No pins created yet')).not.toBeVisible()

          // Like Tab
          await primaryUserPage.getByRole('button', { name: 'Liked' }).click()
          await expect(primaryUserPage.getByText('Your Liked Pins')).toBeVisible()
          await expect(primaryUserPage.getByText('No pins liked yet')).toBeVisible()

          // Board Tab
          await primaryUserPage.getByRole('button', { name: 'Board' }).click()
          await expect(primaryUserPage.getByText('Your saved ideas')).toBeVisible()

          // Verify Created Board 
          await primaryUserPage.locator('.board-grid .board-card').waitFor({ state: 'visible' })
          await expect(primaryUserPage.locator('.board-info')).toBeVisible()
          await expect(primaryUserPage.locator('.board-info h3')).toHaveText('Winter Fashion')
          await expect(primaryUserPage.locator('.board-info p')).toHaveText('1 ideas') //one saved pin 

          // View board
          await primaryUserPage.locator('.board-card img').click()
          await expect(primaryUserPage.url()).toContain('/test/Winter%20Fashion')

          // Verify board page components and elements 

          // Header
          await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
          await expect(primaryUserPage.getByRole('textbox', { name: 'Search users' })).toBeVisible()
          await expect(primaryUserPage.locator('.header-search-bar i ')).toBeVisible()
          await expect(primaryUserPage.getByRole('link', { name: 'Profile' })).toBeVisible()
          await expect(primaryUserPage.locator('.profile-avatar')).toBeVisible()

          // Check sidebar container
          await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
          
          // Board Container
          await expect(primaryUserPage.locator('.board-content')).toBeVisible()
          await expect(primaryUserPage.locator('.board-content .board-header')).toBeVisible()
          await expect(primaryUserPage.getByRole('heading', { name: 'Winter Fashion' })).toBeVisible()
          await expect(primaryUserPage.getByText('Created by test')).toBeVisible()
          await expect(primaryUserPage.getByText('1 pins')).toBeVisible()
          await expect(primaryUserPage.getByText('No pin Saved')).not.toBeVisible()
       
          // Verify Pin added to board
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
        })

        test('Add pin to board on Create pin Page (with Secondary user (jace)', async ({ secondaryCreatePinPage }) => {

          const testImagePath = path.join(__dirname, './test-files/braids.jpeg')
          const pinDetails = {
            title: '10 Gorgeous Ways To Style Box Braids',
            description: 'Box braids are a protective hairstyle where hair is parted into square-shaped sections and then braided, often with extensions, to create a long-lasting, low-maintenance look',
            link: 'https://pinspire.com/braids',
            imagePath: testImagePath
          }
        
          // Upload image
          const fileInput = secondaryCreatePinPage.getByTestId('file-input')
          await fileInput.setInputFiles(pinDetails.imagePath)
        
          // Verify image preview
          await expect(secondaryCreatePinPage.locator('.pin-image')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.edit-button')).toBeVisible()
        
          // Fill pin details
          await secondaryCreatePinPage.locator('#title').type(pinDetails.title)
          await secondaryCreatePinPage.locator('#description').type(pinDetails.description)
          await secondaryCreatePinPage.locator('#link').type(pinDetails.link)

          /* Create a board and Add pin to it */
          await expect(secondaryCreatePinPage.locator('.selected-board')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.selected-board span')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.selected-board i')).toBeVisible()
          await secondaryCreatePinPage.locator('.selected-board i').click()

          await expect(secondaryCreatePinPage.locator('.board-dropdown')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.board-dropdown .no-boards')).toBeVisible()
          // eslint-disable-next-line quotes
          await expect(secondaryCreatePinPage.locator('.no-boards p')).toHaveText("You don't have any boards yet.")
          await expect(secondaryCreatePinPage.locator('.no-boards .create-board-btn')).toBeVisible()

          await secondaryCreatePinPage.locator('.no-boards .create-board-btn').click()

          // Create a board 
          await expect(secondaryCreatePinPage.locator('.modal-content')).toBeVisible()
          await expect(secondaryCreatePinPage.getByText('Create new board')).toBeVisible()
          await expect(secondaryCreatePinPage.getByText('Board name')).toBeVisible()
          await secondaryCreatePinPage.getByRole('textbox', { name: 'Board name' }).fill('Braid Hairstyles')

          await expect(secondaryCreatePinPage.locator('.modal-actions')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.cancel-button')).toBeVisible()
          const saveButton = secondaryCreatePinPage.locator('.save-button-b')
          await expect(saveButton).toBeVisible()
          await saveButton.click()

          // Click the board option and select the created board
          await secondaryCreatePinPage.locator('.selected-board i').click()
          await expect(secondaryCreatePinPage.locator('.board-option')).toBeVisible()
          await expect(secondaryCreatePinPage.getByAltText('Braid Hairstyles')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('span').filter({ hasText: 'Braid Hairstyles' })).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.board-option .pin-count')).toBeVisible()

          await secondaryCreatePinPage.locator('span').filter({ hasText: 'Braid Hairstyles' }).click()

          // Verify publish button becomes enabled
          const publishButton = secondaryCreatePinPage.locator('.publish-button')        
          // Submit pin
          await publishButton.click()
          await secondaryCreatePinPage.getByRole('alert').filter({ hasText: 'Pin created successfully' }).waitFor({ state: 'visible' })
        
          // Verify redirect to pin detail page
          await expect(secondaryCreatePinPage).toHaveURL('/')
          await secondaryCreatePinPage.waitForLoadState('networkidle')
        
          // Verify pin appears on home page
          await expect(secondaryCreatePinPage.getByText(pinDetails.title)).toBeVisible()

          // Verify Board is saved to Board
          await secondaryCreatePinPage.getByRole('link').filter({ has: secondaryCreatePinPage.locator('i.fas.fa-user') }).click()
          await expect(secondaryCreatePinPage.url()).toContain('/profile/jace')
          await secondaryCreatePinPage.getByTestId('loading-spinner').waitFor({ state: 'visible'})
          await secondaryCreatePinPage.waitForLoadState('networkidle')
  
          // verify componet 
          await expect(secondaryCreatePinPage.getByTestId('header-search')).toBeVisible()
          await expect(secondaryCreatePinPage.getByTestId('sidebar-nav')).toBeVisible()
          await expect(secondaryCreatePinPage.getByTestId('profileSection-container')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.profile-section')).toBeVisible()

          // Tab Navigation
          await expect(secondaryCreatePinPage.locator('.tab-navigation')).toBeVisible()
          await expect(secondaryCreatePinPage.getByRole('button', { name: 'Liked' })).toBeVisible()
          await expect(secondaryCreatePinPage.getByRole('button', { name: 'Created' })).toBeVisible()
          await expect(secondaryCreatePinPage.getByRole('button', { name: 'Board' })).toBeVisible()

          // Default Created Tab
          await expect(secondaryCreatePinPage.getByText('Your Created Pins')).toBeVisible()
          await expect(secondaryCreatePinPage.getByText('No pins created yet')).not.toBeVisible()

          // Like Tab
          await secondaryCreatePinPage.getByRole('button', { name: 'Liked' }).click()
          await expect(secondaryCreatePinPage.getByText('Your Liked Pins')).toBeVisible()
          await expect(secondaryCreatePinPage.getByText('No pins liked yet')).toBeVisible()

          // Board Tab
          await secondaryCreatePinPage.getByRole('button', { name: 'Board' }).click()
          await expect(secondaryCreatePinPage.getByText('Your saved ideas')).toBeVisible()

          // Verify Created Board 
          await secondaryCreatePinPage.locator('.board-grid .board-card').waitFor({ state: 'visible' })
          await expect(secondaryCreatePinPage.locator('.board-info')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.board-info h3')).toHaveText('Braid Hairstyles')
          await expect(secondaryCreatePinPage.locator('.board-info p')).toHaveText('1 ideas') //one saved pin 

          // View board
          await secondaryCreatePinPage.locator('.board-card img').click()
          await expect(secondaryCreatePinPage.url()).toContain('/jace/Braid%20Hairstyles')

          /* Verify board page components and elements */ 
          // Header
          await expect(secondaryCreatePinPage.getByTestId('header-search')).toBeVisible()
          await expect(secondaryCreatePinPage.getByRole('textbox', { name: 'Search users' })).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.header-search-bar i ')).toBeVisible()
          await expect(secondaryCreatePinPage.getByRole('link', { name: 'Profile' })).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.profile-avatar')).toBeVisible()

          // Check sidebar container
          await expect(secondaryCreatePinPage.getByTestId('sidebar-nav')).toBeVisible()
          
          // Board Container
          await expect(secondaryCreatePinPage.locator('.board-content')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.board-content .board-header')).toBeVisible()
          await expect(secondaryCreatePinPage.getByRole('heading', { name: 'Braid Hairstyles' })).toBeVisible()
          await expect(secondaryCreatePinPage.getByText('Created by jace')).toBeVisible()
          await expect(secondaryCreatePinPage.getByText('1 pins')).toBeVisible()
          await expect(secondaryCreatePinPage.getByText('No pin Saved')).not.toBeVisible()
       
          // Verify Pin saved to board
          await expect(secondaryCreatePinPage.locator('.pins-grid')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.pin-card')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.pin-card .pin-image-container')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.pin-image-container .pin-image')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.pin-image-container .pin-overlay .pin-title')).toHaveText('10 Gorgeous Ways To Style Box Braids')

          // Verify user info
          await expect(secondaryCreatePinPage.locator('.pin-card .pin-footer')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.pin-card .pin-footer .user-avatar')).toBeVisible()
          await expect(secondaryCreatePinPage.locator('.pin-card .pin-footer .user-name')).toHaveText('jace')
        })

        test('Can Like and unlike own pin and No Like Notification Sent', async ({ pinPage }) => {
          // Like Pin 
          await pinPage.locator('.pin-actions .like-container button').click()
          await expect(pinPage.locator('.pin-actions .like-container .like-count')).toHaveText('1', {
            timeout: 5000,
            waitFor: 'visible'
          })

          await expect(pinPage.locator('.pin-actions .like-container .like-count')).not.toHaveText('0')

          // Unlike Pin
          await pinPage.locator('.pin-actions .like-container button').click()
          await expect(pinPage.locator('.pin-actions .like-container .like-count')).toHaveText('0', {
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

          // Comment Input 
          await expect(pinPage.locator('.pin-comment-input-wrapper')).toBeVisible()
          await expect(pinPage.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(pinPage.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(pinPage.locator('.pin-comment-input-wrapper .pin-comment-submit')).toBeVisible()

          // Comment on own pin
          const commentInput = pinPage.locator('.pin-comment-input')
          await commentInput.type('I love the white collar fur')
          await expect(commentInput).toHaveValue('I love the white collar fur')
          await pinPage.locator('.pin-comment-submit').click()
          await expect(commentCountHeader).toHaveText('1 comments')

          // Comment header toggle down
          await pinPage.locator('.comments-toggle i').click()
          await expect(pinPage.locator('.pin-comments-list')).toBeVisible()

          //  Verify Comment and User
          // First locate the comment container that contains the specific comment text
          const commentContainer = pinPage
            .locator('.pin-comments-list')
            .locator('div')
            .filter({ hasText: 'I love the white collar fur' })
          
          // Verify the comment text is visible
          await expect(commentContainer.locator('span').filter({ hasText: 'I love the white collar fur' })).toBeVisible()
          
          // Verify the username is visible
          await expect(commentContainer.locator('span').filter({ hasText: 'test' })).toBeVisible()

          // Find the comment actions within the same comment container
          const commentActions = commentContainer.locator('.comment-actions')

          //  Verify actions
          await expect(commentActions.locator('.comment-time')).toBeVisible()
          await expect(commentActions.locator('.reply-button')).toBeVisible()
          await expect(commentActions.locator('.like-button')).toBeVisible()

          // VERIFY NO COMMENT NOTIFICATION
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()
          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()
        })

        test('Can Like and Unlike Own Comment - No Like Comment Notification', async ({ pinPage}) => {
          const commentCountHeader = pinPage.locator('.comments-header .comments-count')

          await expect(commentCountHeader).toHaveText('1 comments')
          await pinPage.locator('.comments-toggle i').click()

          await expect(pinPage.locator('.pin-comments-list')).toBeVisible()

          // Verify Comment and User
          const commentContainer = pinPage
            .locator('.pin-comments-list')
            .locator('div')
            .filter({ hasText: 'I love the white collar fur' })

          // Verify the comment text is visible
          await expect(commentContainer.locator('span').filter({ hasText: 'I love the white collar fur' })).toBeVisible()
          
          // Verify the username is visible
          await expect(commentContainer.locator('span').filter({ hasText: 'test' })).toBeVisible()

          const commentActions = commentContainer.locator('.comment-actions')

          //  Verify actions
          await expect(commentActions.locator('.comment-time')).toBeVisible()
          await expect(commentActions.locator('.reply-button')).toBeVisible()
          await expect(commentActions.locator('.like-button')).toBeVisible()

          // Like Comment
          await commentActions.locator('.like-button').click()
          await expect(commentActions.locator('.like-count')).toHaveText('1')

          // Unlike Comment
          await commentActions.locator('.like-button').click()
          await expect(commentActions.locator('.like-count')).toBeHidden()

          // Verify No Like comment Notification received
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()
          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()
        })

        test('pin owner Can reply to own comment, Like and Unlike Reply Comment - No Comment Reply Notification', async ({ pinPage }) => {
          // Verify Initial Comment State 
          const commentCountHeader = pinPage.locator('.comments-header .comments-count')
          await expect(commentCountHeader).toHaveText('1 comments')
          await pinPage.locator('.comments-toggle i').click()


          const commentContainer = pinPage
            .locator('.pin-comments-list')
            .locator('div')
            .filter({ hasText: 'I love the white collar fur'})

          // Verify the coment text is visible 
          await expect(commentContainer.locator('span').filter({
            hasText: 'I love the white collar fur'
          })).toBeVisible()

          // Verify the username is visible
          await expect(commentContainer.locator('span').filter({ hasText: 'test' })).toBeVisible()

          // Find the comment actions within the same comment container
          const commentActions = commentContainer.locator('.comment-actions')

          //  Verify actions
          await expect(commentActions.locator('.comment-time')).toBeVisible()
          await expect(commentActions.locator('.reply-button')).toBeVisible()
          await expect(commentActions.locator('.like-button')).toBeVisible()

          await commentActions.locator('.reply-button').click()

          // Verify Reply input 
          const commentReplyInput = commentContainer.locator('.reply-input-container')
          await expect(commentReplyInput).toBeVisible()
          await expect(commentReplyInput.locator('input')).toBeVisible()
          await expect(commentReplyInput.locator('.reply-submit')).toBeDisabled()

          // Reply to Own Comment
          await commentReplyInput.locator('input').type('Reply to my own comment')
          await expect(commentReplyInput.locator('input')).toHaveValue('Reply to my own comment')

          // Verify submit button is no longer disabled 
          await expect(commentReplyInput.locator('.reply-submit')).not.toBeDisabled()
          await commentReplyInput.locator('.reply-submit i').click()

          // Verify Reply Comment
          const replyDropdown = commentContainer.locator('.replies-section')
          await expect(replyDropdown).toBeVisible()
          await expect(replyDropdown.locator('.show-replies-btn')).toHaveText('1 reply')  // 1 reply

          // Click on dropdown to expand replies
          await replyDropdown.locator('.show-replies-btn i').click()
          
          await expect(replyDropdown.locator('.replies-container.show')).toBeVisible()

          const reply = replyDropdown.locator('.replies-container.show .pin-comment')
            .filter({ hasText: 'Reply to my own comment' })

          await expect(reply.locator('.comment-text')).toContainText('Reply to my own comment')

          // Find the comment actions within the reply
          const replyCommentActions = reply.locator('.comment-actions')
        
          //  Verify Reply actions components
          await expect(replyCommentActions.locator('.comment-time')).toBeVisible()
          await expect(replyCommentActions.locator('.reply-button')).toBeVisible()
          await expect(replyCommentActions.locator('.like-button')).toBeVisible()

          // Like Comment
          await expect(replyCommentActions.locator('.like-count')).toBeHidden()
          await replyCommentActions.locator('.like-button').click()
          await expect(replyCommentActions.locator('.like-count')).toHaveText('1')
          
          // Unlike Comment
          await replyCommentActions.locator('.like-button').click()
          await expect(replyCommentActions.locator('.like-count')).toBeHidden()

          // VERIFY NO REPLY COMMENT NOTIFICATION
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()

        })

        test('Pin owner can reply to own reply', async ({ pinPage }) => {
          // Verify Initial Comment State 
          const commentCountHeader = pinPage.locator('.comments-header .comments-count')
          await expect(commentCountHeader).toHaveText('1 comments')
          await pinPage.locator('.comments-toggle i').click()

          // Verify the main comment elements
          await expect(pinPage.getByText('I love the white collar fur')).toBeVisible()
          await expect(pinPage.locator('.replies-section')).toBeVisible()
          await expect(pinPage.locator('.show-replies-btn')).toHaveText('1 reply')  // 1 reply
          
          // Click to show replies
          await pinPage.locator('.show-replies-btn').click()
          await expect(pinPage.locator('.replies-container.show')).toBeVisible()

          // locate the specific reply
          const reply = pinPage.locator('.replies-container.show .pin-comment')
            .filter({ hasText: 'Reply to my own comment' })

          await expect(reply.locator('.comment-text')).toContainText('Reply to my own comment')

          // Verify comment actions within the reply
          const replyCommentActions = reply.locator('.comment-actions')
        
          //  Verify Reply actions components
          await expect(replyCommentActions.locator('.comment-time')).toBeVisible()
          await expect(replyCommentActions.locator('.reply-button')).toBeVisible()
          await expect(replyCommentActions.locator('.like-button')).toBeVisible()

          // Reply to reply
          await replyCommentActions.locator('.reply-button').click()

          // Verify Reply input 
          const replyInput = reply.locator('.reply-input-container')
          await expect(replyInput).toBeVisible()
          await expect(replyInput.locator('input')).toBeVisible()

          //  Reply to own reply to own comment
          await expect(replyInput.locator('input')).toHaveValue('@test ') // Automatic mention on Reply to Reply

          await replyInput.locator('input').type('Playwright is a great E2E testing Library')
          await expect(replyInput.locator('input')).toHaveValue('@test Playwright is a great E2E testing Library')

          // Verify submit button is no longer disabled 
          await expect(replyInput.locator('.reply-submit')).not.toBeDisabled()
          await replyInput.locator('.reply-submit i').click()

          // Verify reply is visible 
          const comment = pinPage.locator('.replies-container.show .pin-comment')
            .filter({ hasText: '@test Playwright is a great E2E testing Library' })

          await expect(comment).toBeVisible()

          const commentActions = comment.locator('.comment-actions')


          // Like Comment
          await expect(commentActions.locator('.like-count')).toBeHidden()
          await commentActions.locator('.like-button').click()
          await expect(commentActions.locator('.like-count')).toHaveText('1')
        
          // Unlike Comment
          await commentActions.locator('.like-button').click()
          await expect(commentActions.locator('.like-count')).toBeHidden()

          // VERIFY NO REPLY COMMENT NOTIFICATION
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).toBeVisible()
          
        })
      
        test('Pin can be liked by other Users - TEST NOTIFICATION IN REAL-TIME', async ({ pinPage, pinPageWithSecondaryUser }) => {
          // Like primary user pin (Winter Jacket) 
          await pinPageWithSecondaryUser.locator('.pin-actions .like-container button').click()

          await expect(pinPageWithSecondaryUser.locator('.pin-actions .like-container .like-count')).toHaveText('1', {
            timeout: 5000,
            waitFor: 'visible'
          })

          await expect(pinPageWithSecondaryUser.locator('.pin-actions .like-container .like-count')).not.toHaveText('0')

          // VERIFY PRIMARY USER RECIEVED LIKE NOTIFICATION FROM (JACE) SECONDARY
          // pinPage is primary user page
          await expect(pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') })).toBeVisible()

          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).not.toBeVisible()

          // Verify Notication content
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.locator('.notification-item')).toBeVisible()
          await expect(pinPage.locator('.notification-item .notification-message')).toHaveText('jace liked your pin "Black winter jacket"')
          await expect(pinPage.locator('.notification-item .notification-time')).toBeVisible()
        })

        test('can Comment on pin - TEST COMMENT NOTIFICATION IN REAL-TIME', async ({ pinPageWithSecondaryUser, pinPage }) => {
          // Secondary user (jace) comment on primary user (test) pin (winter)
          const commentCountHeader = pinPageWithSecondaryUser.locator('.comments-header .comments-count')
          await expect(commentCountHeader).toHaveText('1 comments')

          // Comment Input 
          await expect(pinPageWithSecondaryUser.locator('.pin-comment-input-wrapper')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('.pin-comment-input-wrapper .pin-comment-submit')).toBeVisible()

          // Comment on pin
          const commentInput = pinPageWithSecondaryUser.locator('.pin-comment-input')
          await commentInput.type('Nice jacket')
          await expect(commentInput).toHaveValue('Nice jacket')
          await pinPageWithSecondaryUser.locator('.pin-comment-submit').click()
          await expect(commentCountHeader).toHaveText('2 comments')

          // Comment header toggle down
          await pinPageWithSecondaryUser.locator('.comments-toggle i').click()
          await expect(pinPageWithSecondaryUser.locator('.pin-comments-list')).toBeVisible()
 
          //  Verify Comment and User
          // First locate the comment container that contains the specific comment text
          const commentContainer = pinPageWithSecondaryUser
            .locator('.pin-comments-list')
            .locator('div')
            .filter({ hasText: 'Nice jacket' })
           
          // Verify the comment text is visible
          await expect(commentContainer.locator('span').filter({ hasText: 'Nice jacket' })).toBeVisible()

          // Verify the username is visible
          await expect(commentContainer.locator('span').filter({ hasText: 'jace' })).toBeVisible()
          // Find the comment actions within the same comment container
          const commentActions = commentContainer.locator('.comment-actions')

          //  Verify actions
          await expect(commentActions.locator('.comment-time')).toBeVisible()
          await expect(commentActions.locator('.reply-button')).toBeVisible()
          await expect(commentActions.locator('.like-button')).toBeVisible()

          // Verify (test) recieves Comment Notification
          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).not.toBeVisible()
          await expect(pinPage.locator('.notification-item .notification-message')).toHaveText('jace commented on your pin: "Nice jacket"')
          await expect(pinPage.locator('.notification-item .notification-time')).toBeVisible()

        })

        test('Can reply to Comments - TEST COMMENT REPLY NOTIFICATION IN REAL-TIME', async  ({ pinPageWithSecondaryUser, pinPage}) => {
          // Verify Initial Comment State 
          const commentCountHeader = pinPageWithSecondaryUser.locator('.comments-header .comments-count')
          await expect(commentCountHeader).toHaveText('2 comments')
          await pinPageWithSecondaryUser.locator('.comments-toggle i').click()

          await expect(pinPageWithSecondaryUser.locator('.pin-comments-list > div:nth-child(2) > div')).toBeVisible()
          await pinPageWithSecondaryUser.locator('.show-replies-btn ', { hasText: '2 replies' }).click()

          await expect(pinPageWithSecondaryUser.locator('div').filter({ hasText: /^testReply to my own commenttodayreply$/ }).nth(1)).toBeVisible()
          await expect(pinPageWithSecondaryUser.locator('div').filter({ hasText: /^test@test Playwright is a great E2E testing Librarytodayreply$/ }).nth(1)).toBeVisible()

          await pinPageWithSecondaryUser.getByRole('button', { name: 'reply' }).nth(1).click()

          await expect(pinPageWithSecondaryUser.locator('.reply-input-container')).toBeVisible()
          const input = pinPageWithSecondaryUser.getByRole('textbox', { name: 'Reply' })
          await input.click()
          await input.type('Where did you buy it')
          await pinPageWithSecondaryUser.locator('.reply-input-container button').click()

          // await pinPageWithSecondaryUser.locator('.show-replies-btn ', { hasText: '3 replies' }).click()

          await expect(pinPageWithSecondaryUser.getByText('jaceWhere did you buy it')).toBeVisible()

          const reply = pinPageWithSecondaryUser.locator('.replies-container.show .pin-comment')
            .filter({ hasText: 'Where did you buy it' })

          // Find the comment actions within the reply
          const replyCommentActions = reply.locator('.comment-actions')
        
          //  Verify Reply actions components
          await expect(replyCommentActions.locator('.comment-time')).toBeVisible()
          await expect(replyCommentActions.locator('.reply-button')).toBeVisible()
          await expect(replyCommentActions.locator('.like-button')).toBeVisible()
          const likeButton =  replyCommentActions.locator('.like-button')
          // Like Comment
          await expect(replyCommentActions.locator('.like-count')).toBeHidden()
          await likeButton.click()
          await expect(replyCommentActions.locator('.like-count')).toHaveText('1')
          
          // Unlike Comment
          await likeButton.click()
          await expect(replyCommentActions.locator('.like-count')).toBeHidden()
 
          // Verify (test) recieved reply NOTIFICATION
          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).not.toBeVisible()
          await expect(pinPage.locator('.notification-item .notification-message')).toHaveText('jace replied to your comment: "Where did you buy it"')
          await expect(pinPage.locator('.notification-item .notification-time')).toBeVisible()

        })

        test('Can reply To Reply to a comment - TEST REPLY NOTIFICATION', async ({ pinPageWithSecondaryUser, pinPage}) => {

          // Verify Initial Comment State 
          const commentCountHeader = pinPageWithSecondaryUser.locator('.comments-header .comments-count')
          await expect(commentCountHeader).toHaveText('2 comments')
          await pinPageWithSecondaryUser.locator('.comments-toggle i').click()

          await expect(pinPageWithSecondaryUser.locator('.pin-comments-list > div:nth-child(2) > div')).toBeVisible()
          await pinPageWithSecondaryUser.locator('.show-replies-btn ', { hasText: '3 replies' }).click()

  
          await pinPageWithSecondaryUser.getByRole('button', { name: 'reply' }).nth(3).click()
          await expect(pinPageWithSecondaryUser.locator('.reply-input-container')).toBeVisible()

          const input = pinPageWithSecondaryUser.getByRole('textbox', { name: 'Reply' })
          await input.click()
          await expect(input).toHaveValue('@test ') // automatic mention
          await input.type('Absolutely')
          await expect(input).toHaveValue('@test Absolutely')
          await pinPageWithSecondaryUser.locator('.reply-input-container button').click()

          const reply = pinPageWithSecondaryUser.locator('.replies-container.show .pin-comment')
            .filter({ hasText: '@test Absolutely' })


          // Find the comment actions within the reply
          const replyCommentActions = reply.locator('.comment-actions')
      
          //  Verify Reply actions components
          await expect(replyCommentActions.locator('.comment-time')).toBeVisible()
          await expect(replyCommentActions.locator('.reply-button')).toBeVisible()
          await expect(replyCommentActions.locator('.like-button')).toBeVisible()
          const likeButton =  replyCommentActions.locator('.like-button')
          // Like Comment
          await expect(replyCommentActions.locator('.like-count')).toBeHidden()
          await likeButton.click()
          await expect(replyCommentActions.locator('.like-count')).toHaveText('1')
        
          // Unlike Comment
          await likeButton.click()
          await expect(replyCommentActions.locator('.like-count')).toBeHidden()

          // Verify (test) recieved reply NOTIFICATION
          await pinPage.getByRole('link').filter({ has: pinPage.locator('i.fas.fa-bell') }).click()
          await expect(pinPage.locator('.notification-system')).toBeVisible()
          await expect(pinPage.locator('.notification-header h3')).toBeVisible()
          await expect(pinPage.locator('.notification-content')).toBeVisible()
          await expect(pinPage.getByText('No notifications yet')).not.toBeVisible()
          await expect(pinPage.locator('.notification-item .notification-message')).toHaveText('jace replied to your comment: "@test Absolutely"')
          await expect(pinPage.locator('.notification-item .notification-time')).toBeVisible()

        })
      })
    })

    test.describe('Board', async () => {
      test('Board can be created on profile page ', async ({ juliaUser}) => {
        await juliaUser.getByRole('link').filter({ has: juliaUser.locator('i.fas.fa-user') }).click()
        await expect(juliaUser.url()).toContain('/profile/julia')
        await juliaUser.getByTestId('loading-spinner').waitFor({ state: 'visible'})
        await juliaUser.waitForLoadState('networkidle')
      
        // verify componet 
        await expect(juliaUser.getByTestId('header-search')).toBeVisible()
        await expect(juliaUser.getByTestId('sidebar-nav')).toBeVisible()
        await expect(juliaUser.getByTestId('profileSection-container')).toBeVisible()
        await expect(juliaUser.locator('.profile-section')).toBeVisible()
    
        // Tab Navigation
        await expect(juliaUser.locator('.tab-navigation')).toBeVisible()
        await expect(juliaUser.getByRole('button', { name: 'Liked' })).toBeVisible()
        await expect(juliaUser.getByRole('button', { name: 'Created' })).toBeVisible()
        await expect(juliaUser.getByRole('button', { name: 'Board' })).toBeVisible()
    
        // Default Created Tab
        await expect(juliaUser.getByText('Your Created Pins')).toBeVisible()
        // await expect(juliaUser.getByText('No pins created yet')).not.toBeVisible()
    
        // Like Tab
        await juliaUser.getByRole('button', { name: 'Liked' }).click()
        await expect(juliaUser.getByText('Your Liked Pins')).toBeVisible()
        await expect(juliaUser.getByText('No pins liked yet')).toBeVisible()
    
        // Board Tab
        await juliaUser.getByRole('button', { name: 'Board' }).click()
        await expect(juliaUser.getByText('Your saved ideas')).toBeVisible()
    
        // Create a board 
        await juliaUser.locator('.create-board-button i').click()
        await expect(juliaUser.locator('.modal-content')).toBeVisible()
        await expect(juliaUser.getByText('Create new board')).toBeVisible()
        await expect(juliaUser.getByText('Board name')).toBeVisible()
        await juliaUser.getByRole('textbox', { name: 'Board name' }).fill('Fashion')
    
        await expect(juliaUser.locator('.modal-actions')).toBeVisible()
        await expect(juliaUser.locator('.cancel-button')).toBeVisible()
        const saveButton = juliaUser.locator('.save-button-b')
        await expect(saveButton).toBeVisible()
        await saveButton.click()
    
        // Verify Created Board 
        await juliaUser.locator('.board-grid .board-card').waitFor({ state: 'visible' })
        await expect(juliaUser.locator('.board-info')).toBeVisible()
        await expect(juliaUser.locator('.board-info h3')).toHaveText('Fashion')
        await expect(juliaUser.locator('.board-info p')).toHaveText('ideas')
    
        // View board
        await juliaUser.locator('.board-card img').click()
        await expect(juliaUser.url()).toContain('/julia/Fashion')
    
        // Verify board page components and elements 
    
        // Header
        await expect(juliaUser.getByTestId('header-search')).toBeVisible()
        await expect(juliaUser.getByRole('textbox', { name: 'Search users' })).toBeVisible()
        await expect(juliaUser.locator('.header-search-bar i ')).toBeVisible()
        await expect(juliaUser.getByRole('link', { name: 'Profile' })).toBeVisible()
        await expect(juliaUser.locator('.profile-avatar')).toBeVisible()
    
        // Check sidebar container
        await expect(juliaUser.getByTestId('sidebar-nav')).toBeVisible()
              
        // Board Container
        await expect(juliaUser.locator('.board-content')).toBeVisible()
        await expect(juliaUser.locator('.board-content .board-header')).toBeVisible()
        await expect(juliaUser.getByRole('heading', { name: 'Fashion' })).toBeVisible()
        await expect(juliaUser.getByText('Created by julia')).toBeVisible()
        await expect(juliaUser.getByText('0 pins')).toBeVisible()
    
        await expect(juliaUser.getByText('No pin Saved')).toBeVisible()
      })

    })
  })
})