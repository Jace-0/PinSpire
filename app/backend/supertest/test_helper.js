const supertest = require('supertest')
const Server = require('../server')
const server = new Server()
const expressApp = server.getApp()
const api = supertest(expressApp)


const baseApi = '/api'

// Authentication API Tests
const authApi = `${baseApi}/auth`

const health = () => {
  return api
    .get('/api/health')
}
const reset = () => {
  return api
    .post('/api/test/reset')
}

const createUser = (userData) => {
  return  api
    .post(`${authApi}/signup`)
    .send(userData)
}

const loginUser = (credentials) => {
  return  api
    .post(`${authApi}/login`)
    .send(credentials)
}

const refreshToken = () => {
  return api
    .post(`${authApi}/refresh-token`)

}

const logout = () => {
  return api
    .post(`${authApi}/logout`)
}

// User API Test
const userApi = `${baseApi}/user`
const updateUserProfileData = () => {
  return api
    .put(`${userApi}/profile/settings`)
}

const updateUserProfileAvatar = () => {
  return api
    .put(`${userApi}/profile/settings/avatar`)
}

const getUserData = (userId) => {
  return api
    .get(`${userApi}/profile/id/${userId}`)
}


// Follow users
const followApi = `${baseApi}/user`
const followUser = (userId) => {
  return api
    .post(`${followApi}/${userId}/followers`)
}

const checkFollowStatus = (userId) => {
  return api
    .get(`${followApi}/followers/check/${userId}`)
}



// Chat
const chatApi = `${baseApi}/chat`

const createChat = () => {
  return api
    .post(`${chatApi}/new`)
}

const sendMessage = () => {
  return api
    .post(`${chatApi}/message`)
}


/* pin.integration.test.js */
// Pin TEST
const pinApi = `${baseApi}/pin`

const createPin = () => {
  return api
    .post(`${pinApi}/`)
}

const likePin = (pinId) => {
  return api
    .post(`${pinApi}/${pinId}/like`)
}

const commentPin = (pinId) => {
  return api
    .post(`${pinApi}/${pinId}/comment`)
}

const likeComment = (commentId) => {
  return api
    .post(`${pinApi}/comments/${commentId}/like`)
}




module.exports = {
  api,
  baseApi,
  server,
  expressApp,
  health,
  createUser,
  loginUser,
  refreshToken,
  logout,
  updateUserProfileData,
  getUserData,
  updateUserProfileAvatar,
  followUser,
  checkFollowStatus,
  createChat,
  sendMessage,
  createPin,
  likePin,
  commentPin,
  likeComment,
  reset
}