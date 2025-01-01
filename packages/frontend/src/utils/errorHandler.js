// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response?.data) {
    return {
      message: error.response.data.error || error.response.data.message,
      status: error.response.status,
      data: error.response.data
    }
  }

  // Network or other errors
  return {
    message: error.message || 'Network error occurred',
    status: 500,
    data: error
  }
}