import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import LoginForm from './LoginForm'
import { AuthProvider } from '../../../context/AuthContext'

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}))

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn()
  })
}))

jest.useFakeTimers()

describe('LoginForm', () => {
  it('should login with valid credentials ', async () => {
    const mockLogin = jest.fn().mockResolvedValue()
    const mockNavigate = jest.fn()

    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate)

    jest.spyOn(require('../../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        login: mockLogin
      }))


    render(<LoginForm/>)

    // fill in the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })

    fireEvent.change(screen.getByLabelText('Password'), {
      target : { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      // check if success message appears
      expect(screen.getByText('Login successful!')).toBeInTheDocument()
    })



    // Fast-forward timer to trigger navigation
    // await new Promise((r) => setTimeout(r, 1000))
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })
    expect(mockNavigate).toHaveBeenCalledWith('/')

  })


  it('should validate email correctly', async () => {
    const { getByLabelText, getByText, queryByText } = render(<LoginForm />)
    /* using Email e.g 'invalid-email OR random text' doesnt work on UI, youre required to add an @ to it, also with .com or domain, it isnt valid*/
    fireEvent.change(getByLabelText('Email'), {
      target: { value: 'test@h' }
    })

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    const submitButton = getByText('Log in')

    fireEvent.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    })

    // Test valid email
    fireEvent.change(getByLabelText('Email'), {
      target: { value: 'valid@email.com' }
    })
    fireEvent.click(submitButton)

    // Error message should not be present for valid email
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address.')).not.toBeInTheDocument()
    })
  }),

  it('should show error message when submitting form with empty email', async () => {
    const { getByText, getByLabelText } = render(<LoginForm />)

    fireEvent.change(getByLabelText('Email'), {
      target: { value: '' }
    })

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(getByText('Please enter a valid email address.')).toBeInTheDocument()
    })
  }),

  it('should show error message when submitting form with empty no passord', async () => {
    const { getByText, getByLabelText } = render(<LoginForm />)

    fireEvent.change(getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })

    fireEvent.change(getByLabelText('Password'), {
      target: { value: '' }
    })

    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(getByText('Password cannot be empty.')).toBeInTheDocument()
    })
  }),

  // Snackbar severity changes based on operation success/failure
  it.only('should display error snackbar when login fails', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Login failed'))
    const mockNavigate = jest.fn()

    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate)

    jest.spyOn(require('../../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        login: mockLogin
      }))

    const { getByLabelText } = render(<LoginForm />)

    fireEvent.change(getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {

      // screen.debug()

      expect(screen.getByText('Login failed')).toBeInTheDocument()
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveClass('MuiAlert-standardError')
      expect(screen.getByText('Login failed')).toBeInTheDocument()
    })

    // Verify navigation wasn't called
    expect(mockNavigate).not.toHaveBeenCalled()

  }),
  // Password field masks input as expected
  it('should mask password input when typing', () => {
    const { getByLabelText } = render(<LoginForm />)

    const passwordInput = getByLabelText('Password')

    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(passwordInput.type).toBe('password')
    expect(passwordInput.value).toBe('password123')
  })
})