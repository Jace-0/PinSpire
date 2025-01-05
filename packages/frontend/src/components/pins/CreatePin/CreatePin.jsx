import { useState } from 'react'
import CustomSnackbar from '../../common/CustomSnackBar'
import Header from './Header'
import Navigation from '../../common/Navigation'
import Content from './Content'
import { pinService } from '../../../services/pinService'
import { useNavigate } from 'react-router-dom'

const CreatePin = () => {
  const navigate = useNavigate()

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  // Snackbar close handler
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return
    setOpenSnackbar(false)
  }

  // State management
  const [pinData, setPinData] = useState({
    title: '',
    description: '',
    link: '',
    board: '',
    image: null
  })

  const handlePublish = async () => {
    try {
      if (!pinData.title || !pinData.image) {
        setSnackbarMessage('Title and image are required')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
        return
      }

      console.log('PinData', pinData)

      const formData = new FormData()
      formData.append('title', pinData.title)
      formData.append('description', pinData.description)
      formData.append('link', pinData.link)
      formData.append('board', pinData.board)
      formData.append('image', pinData.image)

      console.log('FormData', formData)
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value instanceof File ? {
      //     name: value.name,
      //     type: value.type,
      //     size: value.size
      //   } : value)
      // }
      // Call API to create a new pin
      const response = await pinService.createPin(formData)

      if (response.success) {
        setSnackbarMessage(' Pin created successfully ')
        setSnackbarSeverity('success')
        setOpenSnackbar(true)
        setTimeout(() => {
          navigate('/')
        }, 3000)

      }
    } catch (error) {
      console.error('Error creating pin:', error)
      setSnackbarMessage( error.message || 'Error creating pin')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }

  }

  return (
    <>
      <Navigation />
      <Header onPublish={handlePublish} />
      <Content pinData={pinData} setPinData={setPinData} />
      <CustomSnackbar
        open={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
      />
    </>
  )
}


export default CreatePin