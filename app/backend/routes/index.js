const router = require('express').Router()

// Route imports
const authRoutes = require('./auth.router')
const userRoutes = require('./user.router')
const pinRoutes = require('./pin.router')
const chatRouter = require('./chat.router')
const boardRouter = require('./board.router')


router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/pin', pinRoutes)
router.use('/chat', chatRouter)
router.use('/board', boardRouter)

if (process.env.NODE_ENV === 'test') {
  const testRouter = require('./test.router')
  router.use('/test', testRouter)
}

module.exports = router