import { test as base, expect } from '@playwright/test'
import { signUpUser } from './helper'

// Store authenticated contexts
let primaryUserContext
let primaryUserPage
let primaryAuth

let secondaryUserContext
let secondaryUserPage
let secondaryAuth

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

        await primaryUserPage.goto('/')
        await signUpUser(primaryUserPage)

        // Get authentication data from sessionStorage
        primaryAuth = await primaryUserPage.evaluate(() => {
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
        }, primaryAuth)
      }

      // Verify auth state
      const isPrimaryAuthenticated = await primaryUserPage.evaluate(() => {
        const auth = globalThis.sessionStorage.getItem('auth')
        return !!auth && JSON.parse(auth).accessToken !== undefined
      })
      
      if (!isPrimaryAuthenticated) {
        throw new Error('Authentication lost')
      }

      await primaryUserPage.waitForLoadState('networkidle')
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

  juliaUser: async ({ browser }, use) => {
    const context = await browser.newContext()
    let juliaPage = await context.newPage()
    juliaPage.setDefaultTimeout(120000)
    juliaPage.setDefaultNavigationTimeout(800000)

    await juliaPage.goto('/')
    await signUpUser(juliaPage, 'julia@test.com', 'julia90')
    await use(juliaPage)

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
    // verify component
    await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
    await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
     
    await expect(primaryUserPage.locator('.home-container')).toBeVisible()
    
    // Filter Winter Jacket pin by (test) primary user
    await expect(primaryUserPage.locator('.pins-grid')).toBeVisible()
    await primaryUserPage.getByAltText('Black winter jacket').click() // find by image alt text

    // More specific regex pattern to match UUID format
    await expect(primaryUserPage.url()).toMatch(/\/pin\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)
    await primaryUserPage.waitForLoadState('networkidle')

    // verify Pin Details Page component
    await expect(primaryUserPage.getByTestId('header-search')).toBeVisible()
    await expect(primaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
    await expect(primaryUserPage.locator('.pin-details-container')).toBeVisible()

    // PIN IMAGE SECTION
    await expect(primaryUserPage.locator('.pin-details-image-section .pin-main-image')).toBeVisible()

    // PIN CONTENT SECTION
    await expect(primaryUserPage.locator('.pin-details-content')).toBeVisible()

    // Verify Like button
    await expect(primaryUserPage.locator('.pin-actions .like-container button')).toBeVisible()
    // await expect(primaryUserPage.locator('.like-container .like-count')).toHaveText('0')

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
     
    // Verify Comments section
    await expect(primaryUserPage.locator('.pin-comments-section')).toBeVisible()
    await expect(primaryUserPage.locator('.pin-comments-section .comments-header')).toBeVisible()
    await expect(primaryUserPage.locator('.comments-header .comments-count')).toBeVisible()
    // await expect(primaryUserPage.locator('.comments-header .comments-count')).toHaveText('0 comments')
    await expect(primaryUserPage.locator('.comments-header .comments-toggle')).toBeVisible()

    // PinCommentInput
    await expect(primaryUserPage.locator('.pin-comment-input-wrapper')).toBeVisible()
    await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-input')).toBeVisible()
    await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-submit')).toBeVisible()
    await expect(primaryUserPage.locator('.pin-comment-input-wrapper .pin-comment-submit i')).toBeVisible()

    await expect(primaryUserPage.locator('.pin-details-container')).toBeVisible()
    await expect(primaryUserPage.locator('.pin-details-container .pin-details-wrapper')).toBeVisible()
     
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

        await secondaryUserPage.goto('/')
        await signUpUser(secondaryUserPage, 'jace@test.com', 'jace00')

        // Get authentication data from sessionStorage
        secondaryAuth = await secondaryUserPage.evaluate(() => {
          return globalThis.sessionStorage.getItem('auth')
        })

      } else {
        // Reuse existing page
        await secondaryUserPage.goto('/')

        // Ensure auth data is still present
        await secondaryUserPage.evaluate((storedAuth) => {
          if (!globalThis.sessionStorage.getItem('auth')) {
            globalThis.sessionStorage.setItem('auth', storedAuth)
          }
        }, secondaryAuth)
      }

      // Verify auth state
      const isSecondaryAuthenticated = await secondaryUserPage.evaluate(() => {
        const auth = globalThis.sessionStorage.getItem('auth')
        return !!auth && JSON.parse(auth).accessToken !== undefined
      })
      
      if (!isSecondaryAuthenticated) {
        throw new Error('Authentication lost')
      }

      await secondaryUserPage.waitForLoadState('networkidle')
      await use(secondaryUserPage)

    } catch (error) {
      console.error('Secondary user authentication failed:', error)
      throw error
    }
  },

  secondaryCreatePinPage: async ({ secondaryUserPage }, use) => {
    await expect(secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-plus') })).toBeVisible()
    await secondaryUserPage.getByRole('link').filter({ has: secondaryUserPage.locator('i.fas.fa-plus') }).click()
    await expect(secondaryUserPage).toHaveURL('/pin-creation-tool')

    // Header section verification
    const header = secondaryUserPage.locator('.create-pin-header')
    await expect(header).toBeVisible()
    await expect(header.locator('h1')).toHaveText('Create Pin')
    await expect(header.locator('.publish-button')).toBeVisible()

    // Side nav verification
    await expect(secondaryUserPage.getByTestId('sidebar-nav')).toBeVisible()

    // Pin creation tool container
    await expect(secondaryUserPage.locator('.content-container')).toBeVisible()
    await use(secondaryUserPage)

  },

  pinPageWithSecondaryUser: async ({ secondaryUserPage }, use) => {

    // verify component
    await expect(secondaryUserPage.getByTestId('header-search')).toBeVisible()
    await expect(secondaryUserPage.getByTestId('sidebar-nav')).toBeVisible()
         
    await expect(secondaryUserPage.locator('.home-container')).toBeVisible()
    
        
    await secondaryUserPage.locator('.pins-grid').waitFor({ state: 'visible'})
    await expect(secondaryUserPage
      .locator('.pins-grid .pin-card')
      .filter({ has: secondaryUserPage.getByText('Black winter jackettest') })
    ).toBeVisible()
    
    await expect(secondaryUserPage.getByText('Black winter jacket')).toBeVisible()
    await secondaryUserPage.getByText('Black winter jacket').click()
    expect(primaryUserPage.url()).toMatch(/\/pin\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

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

test.beforeAll(async ({ request }) => {
  // Reset DB and create test user
  const response = await request.post('http://localhost:3000/api/test/reset', {
    timeout: 30000, // 30 seconds
    failOnStatusCode: true
  })
  
  if (response.status() !==200){
    throw new Error(`Database reset failed with status ${response.status()}`)
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