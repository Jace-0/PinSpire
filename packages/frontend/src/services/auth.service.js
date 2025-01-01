// services/auth.service.js
import axios from 'axios'

const AUTH_URL = 'http://localhost:3000/api/auth'

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_URL}/signup`, userData)
    return response.data
  } catch (error) {
    console.error('Signup failed:', error)
    throw error // Re-throw the error to handle it in the calling function
  }
}

export const login = async (data) => {
  try {
    const response = await axios.post(`${AUTH_URL}/login`, data)
    return response.data
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// export default {
//   signup,
//   login
// }