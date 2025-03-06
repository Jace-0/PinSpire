const router = require('express').Router()
const boardController = require('../controllers/board.controller.js')
const authentication = require('../middleware/authentication.js')
const sanitization = require('../middleware/sanitization.js')


router.post('/new', authentication, sanitization, boardController.createBoard)
router.get('/', authentication, sanitization, boardController.fetchBoards )
router.get('/:id', authentication, sanitization, boardController.getBoard )
router.get('/:username/:boardName', authentication, sanitization, boardController.getBoardPinsByUsernameAndName )
router.post('/add', authentication, sanitization, boardController.addPinToBoard )
router.post('/remove', authentication, sanitization, boardController.removePinFromBoard )

module.exports = router