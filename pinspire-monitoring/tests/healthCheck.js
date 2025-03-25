/* eslint-disable no-console */
const { chromium } = require('playwright')
require('dotenv').config() // Optional: for loading environment variables
const { expect } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const runHealthCheck = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    console.log('Starting health check...')
    
    // Visit the home page
    const url =  'https://pinspire-fnsl.onrender.com/'
    await page.goto(url)
    
    // Wait for the page to be loaded
    await page.waitForLoadState('networkidle')
    
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
    await expect(page.locator('.card').filter({ hasText: 'Serve my drinks in '})).toBeVisible()
    
    // Create screenshot directory if it doesn't exist
    const screenshotDir = path.join(__dirname, '../screenshot')
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true })
    }

    const screenshotPath = path.join(screenshotDir, 'health-check-screenshot.png')
    console.log('Screenshot will be saved to:', screenshotPath)

    // Take a screenshot
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    })
    
    console.log('Health check completed successfully')
  } catch (error) {
    console.error('Health check failed:', error)
    process.exit(1)
  } finally {
    await browser.close()
  }
}


// Run the health check
runHealthCheck()