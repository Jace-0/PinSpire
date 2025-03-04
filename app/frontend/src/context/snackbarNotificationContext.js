import React, { createContext, useContext, useState } from 'react'
import CustomSnackbar from '../components/common/CustomSnackBar'

const SnackbarNotificationContext = createContext()

export const SnackbarNotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setNotification(prev => ({
      ...prev,
      open: false
    }))
  }


  return (
    <SnackbarNotificationContext.Provider value={{ showNotification }}>
      {children}
      <CustomSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseSnackbar}
      />
    </SnackbarNotificationContext.Provider>
  )
}

export const useSnackbarNotification = () => {
  const context = useContext(SnackbarNotificationContext)
  if (!context) {
    throw new Error('useSnackbarNotification must be used within a SnackbarNotificationProvider')
  }
  return context
}