const supertest = require('supertest')
const { app, server } = require('../app')
const api = supertest(app)
const baseApi = '/api'

// Authentication API Tests
const authApi = `${baseApi}/auth`
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
const updateUserProfileData = (userId) => {
  return api
    .put(`${userApi}/profile/settings/${userId}`)
}

const updateUserProfileAvatar = (userId) => {
  return api
    .put(`${userApi}/profile/settings/${userId}/avatar`)
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


const replyComment = (commentId) => {
  return api
    .post(`${pinApi}/comments/${commentId}/replies`)
}

module.exports = {
  app,
  api,
  server,
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
  replyComment

}