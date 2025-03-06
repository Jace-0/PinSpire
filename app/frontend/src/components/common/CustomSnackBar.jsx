// components/common/CustomSnackbar.jsx
import { Snackbar, Alert } from '@mui/material'

const CustomSnackbar = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={1200}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
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
        {message}
      </Alert>
    </Snackbar>
  )
}

export default CustomSnackbar