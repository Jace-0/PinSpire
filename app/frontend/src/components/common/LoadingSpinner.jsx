import { CircularProgress, Box } from '@mui/material'

const LoadingSpinner = () => (
  <Box
    data-testid="loading-spinner"
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress
      size={40}
      sx={{
        color: '#e60023', // Pinterest red color
        '& .MuiCircularProgress-circle': {
          strokeLinecap: 'round',
        }
      }}
    />
  </Box>
)

export default LoadingSpinner