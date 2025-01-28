const router = require('express').Router();
const pinController = require('../controllers/pin.controller.js')
const authentication = require('../middleware/authentication.js')
const sanitization = require('../middleware/sanitization.js')
const upload = require('../util/multerConfig.js')

// TESTING
router.get('/ping', (req, res) => {
    res.send('pong')
})

// router.get('/all', authentication, pinController.getAllPins);
router.get('/:id', authentication, sanitization, pinController.getPinById);
router.post('/', authentication, upload.single('image'), sanitization ,pinController.createPin);
router.get('/user/:id', authentication, sanitization, pinController.getUserPins);
router.get('/', authentication, pinController.getAllPins )
router.post('/:id/comment', authentication, sanitization,  pinController.addComment )
router.post('/:id/like', authentication, sanitization, pinController.likePin )
router.post('/comments/:commentId/replies', authentication, sanitization, pinController.replyComment);
router.post('/comments/:commentId/like', authentication, sanitization, pinController.likeComment);
router.get('/liked-pins/user', authentication, sanitization, pinController.getLikedPins)


module.exports = router;

