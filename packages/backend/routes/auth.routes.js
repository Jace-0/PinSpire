const router = require('express').Router();
const authController = require('../controllers/auth.controller.js')
const authentication = require('../middleware/authentication.js')

// TESTING
router.get('/ping', (req, res) => {
    res.send('pong')
})

// Auth routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/refresh-token', authentication, authController.refreshToken);
router.post('/logout', authentication, authController.logout);


module.exports = router;
