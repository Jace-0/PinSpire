const router = require('express').Router();
const userController = require('../controllers/user.controller.js')
const authentication = require('../middleware/authentication.js')
const sanitizeInput = require('../middleware/sanitization.js')
const upload = require('../util/multerConfig.js')

// const upload = multer({
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB limit
//     },
//     fileFilter: (req, file, cb) => {
//         // Check file type
//         if (!file.mimetype.startsWith('image/')) {
//             return cb(new Error('Only images are allowed'));
//         }
//         cb(null, true);
//     }
// });

// TESTING
router.get('/ping', (req, res) => {
    res.send('pong')
})


// User routes
router.get('/profile/id/:id', authentication, userController.getUserById);
router.get('/profile/username/:username', authentication, userController.getUserByUsername);

// Update user settings
router.put('/profile/settings/:id', authentication, sanitizeInput,  userController.updateUser);
router.put('/profile/settings/:id/avatar', authentication, upload.single('avatar'), userController.updateAvatar);

// Follow
router.post('/:id/followers', authentication, sanitizeInput, userController.followUser)
router.get('/followers/check/:id', authentication, userController.checkFollowStatus)


module.exports = router;
