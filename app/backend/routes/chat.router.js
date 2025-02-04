const router = require('express').Router()
const chatController = require('../controllers/chat.controller')
const authentication = require('../middleware/authentication')
const sanitization = require('../middleware/sanitization.js')

router.get('/', authentication, sanitization, chatController.getUserChats)
router.get('/:chatId/messages', sanitization, authentication, chatController.getChatMessages)
router.post('/new', authentication, sanitization, chatController.createChat)
router.post('/message', authentication, sanitization, chatController.sendMessage)

module.exports = router