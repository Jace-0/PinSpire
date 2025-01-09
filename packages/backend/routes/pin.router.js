const router = require('express').Router();
const pinController = require('../controllers/pin.controller.js')
const authentication = require('../middleware/authentication.js')
const upload = require('../util/multerConfig.js')

// TESTING
router.get('/ping', (req, res) => {
    res.send('pong')
})

// router.get('/all', authentication, pinController.getAllPins);
router.get('/:id', authentication, pinController.getPinById);
router.post('/', authentication, upload.single('image') ,pinController.createPin);
router.get('/user/:id', authentication, pinController.getUserPins);
router.get('/', authentication, pinController.getAllPins )
router.post('/:id/comment', authentication, pinController.addComment )
router.post('/:id/like', authentication, pinController.likePin )
router.post('/comments/:commentId/replies', authentication, pinController.replyComment);
router.post('/comments/:commentId/like', authentication, pinController.likeComment);


module.exports = router;