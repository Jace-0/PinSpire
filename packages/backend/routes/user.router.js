const router = require('express').Router();
const userController = require('../controllers/user.controller.js')
const authentication = require('../middleware/authentication.js')

// TESTING
router.get('/ping', (req, res) => {
    res.send('pong')
})


// User routes
router.get('/profile/:id', authentication, userController.getUserById);

module.exports = router;
