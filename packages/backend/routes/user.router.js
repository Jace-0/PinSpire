const router = require('express').Router();
const userController = require('../controllers/user.controller.js')
const authentication = require('../middleware/authentication.js')

// TESTING
router.get('/ping', (req, res) => {
    res.send('pong')
})


// User routes
router.get('/profile/id/:id', authentication, userController.getUserById);
router.get('/profile/username/:username', authentication, userController.getUserByUsername);

// Update user settings
router.put('/profile/settings/:id', authentication, userController.updateUser);

module.exports = router;
