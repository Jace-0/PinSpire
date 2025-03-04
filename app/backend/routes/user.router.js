const router = require('express').Router()
const userController = require('../controllers/user.controller.js')
const authentication = require('../middleware/authentication.js')
const { invalidIdHandler } = require('../middleware/middleware.js')
const sanitizeInput = require('../middleware/sanitization.js')
const upload = require('../util/multerConfig.js')

// TESTING
router.get('/ping', (req, res) => {
  res.send('pong')
})


// User routes
router.get('/profile/id/:id', authentication, invalidIdHandler, userController.getUserById)
router.get('/profile/username/:username', authentication, userController.getUserByUsername)

// Update user settings
router.put('/profile/settings/', authentication, invalidIdHandler, sanitizeInput,  userController.updateUser)
router.put('/profile/settings/avatar', authentication, invalidIdHandler, upload.single('avatar'), userController.updateAvatar )

// Follow
router.post('/:id/followers', authentication, invalidIdHandler, sanitizeInput, userController.followUser)
router.get('/followers/check/:id', authentication, invalidIdHandler, userController.checkFollowStatus)


// Search User
router.get('/search', authentication, sanitizeInput, userController.searchUsers)


module.exports = router
