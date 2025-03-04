import { useState } from 'react'
import Header from './Header'
import Navigation from '../../../components/common/Navigation'
import Content from './Content'
import { pinService } from '../../../services/pinService'
import { useNavigate } from 'react-router-dom'
import { useSnackbarNotification } from '../../../context/snackbarNotificationContext'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const CreatePin = () => {
  const navigate = useNavigate()
  const { showNotification } = useSnackbarNotification()
  const [ loading, setLoading ] = useState(false)


  // State management
  const [pinData, setPinData] = useState({
    title: '',
    description: '',
    link: '',
    board: '',
    image: null
  })

  const handlePublish = async () => {
    setLoading(true)
    try {
      if (!pinData.title || !pinData.image) {
        setLoading(false)
        showNotification('Title and image are required', 'error')
        return
      }

      const formData = new FormData()
      formData.append('title', pinData.title)
      formData.append('description', pinData.description)
      formData.append('link', pinData.link)
      formData.append('board', pinData.board)
      formData.append('image', pinData.image)

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
        setLoading(false)
        showNotification('Pin created successfully', 'success')
        // setTimeout(() => {
        navigate('/')
        // }, 3000)

      }
    } catch (error) {
      showNotification(error.message || 'Error creating pin', 'error')
    }

  }


  return (
    <>
      <Navigation />
      <Header onPublish={handlePublish} />
      <Content pinData={pinData} setPinData={setPinData} />
      {loading && <LoadingSpinner/>}
    </>
  )
}


export default CreatePin