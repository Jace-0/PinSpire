import  { expect } from './test-setup'
const signUpUser = async (page, email = 'test@pinspire.com', password = 'test01') => {
  await page.getByRole('link', { name: 'Sign up', exact: true }).click()
  await page.getByRole('textbox', { name: 'Email' }).fill(email)
  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('textbox', { name: 'Date' }).fill('2001-02-13')
  await page.getByRole('button', { name: 'Sign Up'}).click()
  await page.getByText('SignUp successful!').waitFor({ state: 'visible'})
  // await expect(page.getByText('SignUp successful!')).toBeVisible()

  // Wait for navigation with explicit timeout
  await Promise.all([
    page.waitForURL('/', { timeout: 80000 }),
    page.waitForLoadState('networkidle')
  ])
}

const signUpNewUser = async ( page, email, password) => {
  return signUpUser(page, email, password)
}

const loginUser = async (page, email = 'test@pinspire.com', password = 'test01') => {
  await page.getByRole('link', { name: 'Log in', exact: true }).click()
  await page.getByRole('textbox', { name: 'Email' }).fill(email)
  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('button', { name: 'Log in'}).click()
  await page.getByRole('alert').filter({ hasText: 'Login successful!' }).waitFor({ state: 'visible' })
  await expect(page.getByRole('alert').filter({ hasText: 'Login successful!' })).toBeVisible()
}


export {
  signUpUser, 
  loginUser,
  signUpNewUser
}