import { useState } from 'react'
import { TextField, Button, Card, CardContent, Typography, Box, Snackbar, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
const SignupForm = () => {
  const navigate = useNavigate()

  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const { signup } = useAuth() // Access the signup function from context

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnackbar(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address.')
      setSnackbarMessage('Please enter a valid email address.')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    if (!password) {
      setError('Password cannot be empty.')
      setSnackbarMessage('Password cannot be empty.')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    if (!date) {
      setError('Date cannot be empty.')
      setSnackbarMessage('Date cannot be empty.')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }


    try {
      const userData = { email, password, dob: date }
      await signup(userData)
      setSnackbarMessage('Signup successful!')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)

      // Delay navigation
      setTimeout(() => {
        navigate('/')
      }, 1000) // 1 second

    } catch (error) {
      console.error(error)
      setSnackbarMessage(error.message || 'Sign up failed')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      // setError(error.message)
    }
  }

  return (
    <Box display='flex' justifyContent='Center' alignItems='center' minHeight="100vh" bgcolor="#f5f5f5"   sx={{ fontFamily: 'Noto Sans, sans-serif', overflow: 'hidden', paddingRight: 2 }}>
      <Card sx={{
        maxWidth: 320,
        padding: 2,
        backgroundColor: 'rgb(255, 255, 255)',
        borderRadius: '32px',
        position: 'relative',
        textAlign: 'center',
        margin: 'auto',
        minHeight: 'initial',
        boxShadow: 'rgba(0, 0, 0, 0.45) 0px 2px 10px',
        width: 300,
        height: 500
      }}>
        <CardContent sx={{ padding: 2, textAlign: 'left' }}>
          <Typography variant="h5" component="div" gutterBottom textAlign='center'>
            Welcome to PinSpire
            <h6 style={{ fontWeight: -1,  marginTop: 5, marginBottom: 5 }}>Pinterest Clone</h6>
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin='normal'
              label="Email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ borderRadius: '20px', '& .MuiOutlinedInput-root': { borderRadius: '20px' , maxHeight: 50 } }}
            />
            <TextField
              fullWidth
              margin='normal'
              label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ borderRadius: '20px', '& .MuiOutlinedInput-root': { borderRadius: '20px' , maxHeight: 50 } }}
            />

            <TextField
              fullWidth
              margin='normal'
              label="Date"
              type="date"
              InputLabelProps={{ shrink : true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={{ borderRadius: '20px', '& .MuiOutlinedInput-root': { borderRadius: '20px' , maxHeight: 50 } }}
            />
            <Button type="submit" variant='contained' fullWidth  sx={{
              mt: 2,
              backgroundColor: '#E60023',
              borderRadius: '20px',
              '&:hover': {
                backgroundColor: '#E60023',
              },
            }}>Sign Up</Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'rgb(22, 17, 17)' , marginTop: 4 }}>
            Already a member? <a href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Log in</a>
          </Typography>
        </CardContent>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            borderRadius: '16px',
            fontWeight: 500,
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#E60023',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#cc0000',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default SignupForm