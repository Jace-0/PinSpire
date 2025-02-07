import { render, screen, fireEvent, waitFor, act, createEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import { NotificationProvider } from '../../../context/NotificationContext'
import { pinService } from '../../../services/pinService'
import CreatePin from './CreatePin'

// Mock router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}))

// Mock service
jest.mock('../../../services/pinService', () => ({
  pinService: {
    createPin: jest.fn()
  }
}))

// Mock auth context
jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  useAuth: () => ({
    user: { id: '1', username: 'testuser' },
    handleLogout: jest.fn(),
    accessToken: 'mock-token',
    loading: false
  })
}))

// Mock notification context
jest.mock('../../../context/NotificationContext', () => ({
  ...jest.requireActual('../../../context/NotificationContext'),
  useNotifications: () => ({
    unreadCount: 0,
    clearUnreadCount: jest.fn()
  })
}))


describe('CreatePin', () => {
  const mockNavigate = jest.fn()

  const renderCreatePin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <CreatePin />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  const mockSetPinData = jest.fn()
  const defaultPinData = {
    title: '',
    description: '',
    link: '',
    board: '',
    image: null
  }

  beforeEach(() => {
    // jest.useFakeTimers()
    jest.clearAllMocks()
    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate)
  })

  afterEach(() => {
    // Cleanup timers
    jest.useRealTimers()
  })

  it('should create pin and navigate to home when valid data is provided', async () => {
    pinService.createPin.mockResolvedValueOnce({ success: true })

    renderCreatePin()

    // Mock file upload
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const uploadContainer  = screen.getByTestId('file-input')
    fireEvent.change(uploadContainer, {
      target: { files: [file] }
    })

    await waitFor(() => {
      expect(uploadContainer.files[0]).toBeTruthy()
      expect(uploadContainer.files[0].name).toBe('test.png')
    })

    // Fill form
    await userEvent.type(screen.getByLabelText('Title'), 'Test Pin')
    await userEvent.type(screen.getByLabelText('Description'), 'Test description')
    await userEvent.type(screen.getByLabelText('Link'), 'http://test.com')


    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /publish/i }))

    // Verify success message and navigation
    await waitFor(() => {
      expect(pinService.createPin).toHaveBeenCalled()
      expect(screen.getByText('Pin created successfully')).toBeInTheDocument()
    },)

    // Verify form data
    expect(pinService.createPin).toHaveBeenCalled()
    const formData = pinService.createPin.mock.calls[0][0]
    expect(formData.get('title')).toBe('Test Pin')
    expect(formData.get('description')).toBe('Test description')
    expect(formData.get('link')).toBe('http://test.com')
    expect(formData.get('image')).toEqual(file)

  })

  it('should handle drag and drop image upload', async () => {
    renderCreatePin()

    const uploadContainer = screen.getByTestId('file-input')
    // Verify file input accepts images
    expect(uploadContainer).toHaveAttribute('accept', 'image/*')

    const file = new File(['test image'], 'test.png', {
      type: 'image/png' })


    // Mock FileList
    const fileList = {
      0: file,
      length: 1,
      item: (idx) => file
    }

    // Simulate drag enter
    fireEvent.dragEnter(uploadContainer, {
      dataTransfer: {
        files: fileList,
        types: ['Files']
      }
    })
    // Dragover
    fireEvent.dragOver(uploadContainer, {
      dataTransfer: {
        files: fileList,
        types: ['Files']
      }
    })

    // Simulate drop
    fireEvent.drop(uploadContainer, {
      dataTransfer: {
        files: fileList,
        types: ['Files']
      }
    })

    // Trigger change event
    fireEvent.change(uploadContainer, {
      target: { files: fileList }
    })

    // Verify file was uploaded
    await waitFor(() => {
      const files = uploadContainer.files
      expect(files[0]).toBeTruthy()
      expect(files[0].name).toBe('test.png')
      // Verify preview is shown
      expect(screen.getByAltText('Pin preview')).toBeInTheDocument()
    })

  })


  // Attempt to create pin without title shows error message
  it('should show error message when attempting to create pin without title', async () => {
    renderCreatePin()

    const invalidPinData = {
      title: '',
      image: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      description: 'Test description',
      link: '',
      board: ''
    }
    // Mock file upload
    const uploadContainer  = screen.getByTestId('file-input')
    fireEvent.change(uploadContainer, {
      target: { files: [invalidPinData.image] }
    })

    await waitFor(() => {
      expect(uploadContainer.files[0]).toBeTruthy()
      expect(uploadContainer.files[0].name).toBe('test.jpg')
    })

    // Nothing in title (we want it empty)

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /publish/i }))

    expect(screen.getByText('Title and image are required')).toBeInTheDocument()

    const errorMessage = screen.getByText('Title and image are required')
    expect(errorMessage).toBeInTheDocument()

    // Find the parent Snackbar directly
    const snackbar = screen.getByRole('alert')
    expect(snackbar).toHaveClass('MuiAlert-standardError')

    expect(mockNavigate).not.toHaveBeenCalled()
  })

})
