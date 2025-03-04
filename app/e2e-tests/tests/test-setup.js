import { test as base, expect } from '@playwright/test'
import { signUpUser, signUpNewUser } from './helper'
const path = require('path')


// Store authenticated contexts
let primaryUserContext
let primaryUserPage
let authData

let secondaryUserContext
let secondaryUserPage
// let secondaryAuthData

// Create test fixture with authentication support
export const test = base.extend({
  // Regular page for non-authenticated tests
  page: async ({ page }, use) => {
    await page.goto('/')
    await use(page)
  },

  // Primary authenticated user fixture
  primaryUserPage: async ({ browser }, use) => {
    try {
      if (!primaryUserContext) {
        // Sign in only once and reuse the context
        primaryUserContext = await browser.newContext()
        primaryUserPage = await primaryUserContext.newPage()

        primaryUserPage.setDefaultTimeout(120000)  // 2 minutes for all operations
        primaryUserPage.setDefaultNavigationTimeout(800000)
            
        // Reset DB and create test user
        const response = await primaryUserPage.request.post('http://localhost:3000/api/test/reset', {
          timeout: 30000, // 30 seconds
          failOnStatusCode: true
        })

        if (response.status() !==200){
          throw new Error(`Database reset failed with status ${response.status()}`)
        }

        await primaryUserPage.goto('/')
        await signUpUser(primaryUserPage)

        await primaryUserPage.waitForURL('/')
        await primaryUserPage.waitForLoadState('networkidle')


        // Get authentication data from sessionStorage
        authData = await primaryUserPage.evaluate(() => {
          return globalThis.sessionStorage.getItem('auth')
        })

      } else {
        // Reuse existing page
        await primaryUserPage.goto('/')
        
        // Ensure auth data is still present
        await primaryUserPage.evaluate((storedAuth) => {
          if (!globalThis.sessionStorage.getItem('auth')) {
            globalThis.sessionStorage.setItem('auth', storedAuth)
          }
        }, authData)
        
        await primaryUserPage.waitForLoadState('networkidle')
      }
      
      // Verify auth state
      const isAuthenticated = await primaryUserPage.evaluate(() => {
        const auth = globalThis.sessionStorage.getItem('auth')
        return !!auth && JSON.parse(auth).accessToken !== undefined
      })
      
      if (!isAuthenticated) {
        throw new Error('Authentication lost')
      }

      await use(primaryUserPage)
        
    } catch (error) {
      console.error('Primary user authentication failed:', error)
      throw error
    }
  },

  // User profile page fixture
  userProfilePage: async ({ primaryUserPage }, use) => {
    await primaryUserPage.getByRole('link').filter({ 
      has: primaryUserPage.locator('i.fas.fa-user') 
    }).click()
    await primaryUserPage.waitForURL('profile/test', { timeout: 5000 })
    await primaryUserPage.waitForLoadState('networkidle')
    await use(primaryUserPage)
  },
  
  // Profile settings page fixture
  profileSettingsPage: async ({ userProfilePage }, use) => {
    await userProfilePage.getByRole('button', { name: 'Edit profile' }).click()
    await userProfilePage.waitForURL(/\/settings\/profile/, { timeout: 5000 })
    await userProfilePage.waitForLoadState('networkidle')
    await use(userProfilePage)
  },

  newMessagePage: async ({ primaryUserPage }, use) => {
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
    await use(primaryUserPage)
    
  },

  createPinPage: async ({ primaryUserPage }, use) => {
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

    await use(primaryUserPage)

  },

  pinPage: async ({ primaryUserPage }, use) => {
    await primaryUserPage.waitForLoadState('networkidle')


    // verify component
    await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
    await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
     
    await expect(primaryUserPage.locator('.home-container')).toBeVisible()
    

    // Verify Created Pin is live
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
    // await expect(primaryUserPage.getByTestId('loading-spinner')).toBeVisible()

    // More specific regex pattern to match UUID format
    await expect(primaryUserPage.url()).toMatch(/\/pin\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)


    // verify component
    await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
    await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()

    await expect(primaryUserPage.locator('.pin-details-container')).toBeVisible()
    await expect(primaryUserPage.locator('.pin-details-container .pin-details-wrapper')).toBeVisible()

    // PIN IMAGE SECTION
    await expect(primaryUserPage.locator('.pin-details-image-section .pin-main-image')).toBeVisible()

    // PIN CONTENT SECTION
    await expect(primaryUserPage.locator('.pin-details-content')).toBeVisible()
     
    await use(primaryUserPage)

  },

  // Secondary authenticated user fixture (for interaction testing)
  secondaryUserPage: async ({ browser }, use) => {
    try {
      if (!secondaryUserContext) {
        // Sign in only once and reuse the context
        secondaryUserContext = await browser.newContext()
        secondaryUserPage = await secondaryUserContext.newPage()

        secondaryUserPage.setDefaultTimeout(120000)
        secondaryUserPage.setDefaultNavigationTimeout(800000)
            
        // Reset DB and create test user
        // await page.request.post('http://localhost:3000/api/testing/reset')
        await secondaryUserPage.goto('/')
        // await secondaryUserPage.waitForLoadState('networkidle')
        await signUpNewUser(secondaryUserPage, 'jace@test.com', 'jace000')

      } else {
        // Reuse existing page
        await secondaryUserPage.goto('/')
        // await secondaryUserPage.waitForLoadState('networkidle')
      }

      await secondaryUserPage.waitForLoadState('networkidle')

      await use(secondaryUserPage)
  

    } catch (error) {
      console.error('Secondary user authentication failed:', error)
      throw error
    }
  },

  pinPageWithSecondaryUser: async ({ secondaryUserPage }, use) => {

    // verify component
    await expect(secondaryUserPage.getByTestId('header-search')).toBeVisible()
    await expect(secondaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
         
    await expect(secondaryUserPage.locator('.home-container')).toBeVisible()
    
        
    await secondaryUserPage.locator('.pins-grid').waitFor({ state: 'visible'})
    await expect(secondaryUserPage.locator('.pins-grid .pin-card')).toBeVisible()
    await expect(secondaryUserPage.getByText('Black winter jacket')).toBeVisible()
    await secondaryUserPage.getByText('Black winter jacket').click()
    await expect(primaryUserPage.url()).toMatch(/\/pin\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    // await secondaryUserPage.getByTestId('loading-spinner').waitFor({ state: 'visible'})

    // verify component
    await expect(secondaryUserPage.getByTestId('header-search')).toBeVisible()
    await expect(secondaryUserPage.getByTestId('sidebar-nav')).toBeVisible()

    await expect(secondaryUserPage.locator('.pin-details-container')).toBeVisible()
    await expect(secondaryUserPage.locator('.pin-details-container .pin-details-wrapper')).toBeVisible()

    // PIN IMAGE SECTION
    await expect(secondaryUserPage.locator('.pin-details-image-section .pin-main-image')).toBeVisible()

    // PIN CONTENT SECTION
    await expect(secondaryUserPage.locator('.pin-details-content')).toBeVisible()
     
    await use(secondaryUserPage)
  }


})

// Cleanup contexts after all tests
test.afterAll(async () => {
  if (primaryUserContext) {
    await primaryUserContext.close()
    primaryUserContext = null
  }
  if (secondaryUserContext) {
    await secondaryUserContext.close()
    secondaryUserContext = null
  }
})

export { expect }