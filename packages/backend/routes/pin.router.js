const router = require('express').Router();
const pinController = require('../controllers/pins.controller.js')
const authentication = require('../middleware/authentication.js')

// TESTING
router.get('/ping', (req, res) => {
    res.send('pong')
})

// router.get('/all', authentication, pinController.getAllPins);
router.get('/:id', authentication, pinController.getPinById);
router.post('/', authentication, pinController.createPin);
router.get('/user/:id', authentication, pinController.getUserPins);


module.exports = router;