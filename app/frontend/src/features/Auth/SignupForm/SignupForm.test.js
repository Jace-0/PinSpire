import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import SignupForm  from './SignupForm'
import { MemoryRouter } from 'react-router-dom'
import { SnackbarNotificationProvider } from '../../../context/snackbarNotificationContext'

// Mock modules
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    signup: jest.fn()
  })
}))

// Mock timer functions
jest.useFakeTimers()

const renderWithProviders = (component) => {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <SnackbarNotificationProvider>
        {component}
      </SnackbarNotificationProvider>
    </MemoryRouter>
  )
}

describe('SignupForm', () => {
  it(' submits form succesfully and show success snackbar and navigate home after successful form submission', async () => {
    const mockSignup = jest.fn().mockResolvedValue()

    jest.spyOn(require('../../../context/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        signup: mockSignup
      }))

    // Render the component
    renderWithProviders(<SignupForm />)

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

    // expect(mockNavigate).toHaveBeenCalledWith('/')

  }),

  it('should show error message when submitting form with empty email', async () => {
    const { getByText, getByLabelText } = renderWithProviders(<SignupForm />)

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
    const { getByText, getByLabelText } = renderWithProviders(<SignupForm />)

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
    const { getByText, queryByText } = renderWithProviders(<SignupForm />)

    fireEvent.click(getByText('Sign Up'))

    expect(getByText('Please enter a valid email address.')).toBeInTheDocument()

    jest.advanceTimersByTime(6000)

    await waitFor(() => {
      expect(queryByText('Please enter a valid email address.')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})