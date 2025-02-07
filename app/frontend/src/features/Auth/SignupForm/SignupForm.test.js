import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import SignupForm  from './SignupForm'
// import { useAuth } from '../../../context/AuthContext'

// Mock modules
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}))

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    signup: jest.fn()
  })
}))

// Mock timer functions
jest.useFakeTimers()

describe('SignupForm', () => {
  it(' submits form succesfully and show success snackbar and navigate home after successful form submission', async () => {
    const mockSignup = jest.fn().mockResolvedValue()
    const mockNavigate = jest.fn()

    // Replace default mocks with our controlled versions
    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate)

    jest.spyOn(require('../../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        signup: mockSignup
      }))

    // Render the component
    render(<SignupForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2023-01-01' }
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    // Wait for and verify the expected outcomes
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        dob: '2023-01-01'
      })
      // Check if success message appears
      expect(screen.getByText('Signup successful!')).toBeInTheDocument()

    })


    // Fast-forward timer to trigger navigation
    // await new Promise((r) => setTimeout(r, 1000))
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })
    expect(mockNavigate).toHaveBeenCalledWith('/')

  }),

  it('should show error message when submitting form with empty email', async () => {
    const { getByText, getByLabelText } = render(<SignupForm />)

    fireEvent.change(getByLabelText('Email'), {
      target: { value: '' }
    })

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    fireEvent.change(getByLabelText('Date'), {
      target: { value: '2023-01-01' }
    })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(getByText('Please enter a valid email address.')).toBeInTheDocument()
    })
  }),

  it('should show error message when submitting form with empty email', async () => {
    const { getByText, getByLabelText } = render(<SignupForm />)

    fireEvent.change(getByLabelText('Email'), {
      target: { value: '' }
    })

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    fireEvent.change(getByLabelText('Date'), {
      target: { value: '2023-01-01' }
    })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(getByText('Please enter a valid email address.')).toBeInTheDocument()
    })
  }),

  it('should auto-hide the snackbar after 6 seconds', async () => {
    const { getByText, queryByText } = render(<SignupForm />)

    fireEvent.click(getByText('Sign Up'))

    expect(getByText('Please enter a valid email address.')).toBeInTheDocument()

    jest.advanceTimersByTime(6000)

    await waitFor(() => {
      expect(queryByText('Please enter a valid email address.')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})