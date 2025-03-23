const { redisClient } = require('../util/redis')
// const logger = require('../util/logger')
const { sequelize } = require('../util/db')
const { Board, BoardPin, Pin, User } = require('../models')
const { CACHE_KEYS, CACHE_TTL } = require('../util/cache_KEY_TTL')



const boardController = {

  // Create board
  createBoard: async (req, res, next) => {
    try {

      const userId = req.user.id
      const  { name } = req.body

      // Check if user exists
      const user = await User.findOne({ where: { id: userId } })

      if (!user) {
        return res.status(400).json({ 'Error': 'User not found' })
      }

      const board = await Board.create({
        user_id: userId,
        name,
      })

      // Invalidate Redis Cache
      await redisClient.del(CACHE_KEYS.userBoards(userId))

      // console.log(' BOARD', JSON.stringify(board, null, 2))

      return res.status(201).json({
        success: true,
        board,
      })
    } catch (error) {
      next(error)
    }
  },

  //   Fetch all boards for a user
  fetchBoards: async (req, res, next) => {
    try {
      const userId = req.user.id

      const cacheKey = CACHE_KEYS.userBoards(userId)
      const cacheData = await redisClient.get(cacheKey)
      if (cacheData){
        const parsed = JSON.parse(cacheData)
        return res.status(200).json({
          success: true,
          boards: parsed,
          source: 'cache'
        })
      }

      const boards = await Board.findAll({
        where: { user_id: userId },
        attributes: {
          include: [
            // Get Pin Count
            [
              sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM board_pins
                  WHERE board_id = "Board"."id"
                )`), 'savedCount'
            ]
          ],
        }
      })

      // console.log('USER BOARD', JSON.stringify(boards, null, 2))

      await redisClient.setEx(
        cacheKey,
        CACHE_TTL.BOARDS,
        JSON.stringify(boards)
      )

      return res.status(200).json({
        success: true,
        source: 'database',
        boards
      })

    }catch (error) {
      next(error)
    }
  },

  // Get a specific board with its pins
  getBoard: async (req, res, next) => {
    try {
      const userId = req.user.id
      const boardId = req.params.id

      const cacheKey = CACHE_KEYS.board(boardId)
      const cacheData = await redisClient.get(cacheKey)
      if (cacheData){
        const parsed = JSON.parse(cacheData)
        return res.status(200).json({
          success: true,
          board: parsed,
          source: 'cache'
        })
      }
      const board = await Board.findOne({
        where: { id: boardId, user_id: userId },
        include: [
          {
            model: Pin,
            as: 'pins',
            through: { attributes: [] }, // Exclude junction table attributes
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar_url']

              }
            ]
          }
        ]
      })

      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Board not found'
        })
      }

      // console.log('BOARD PINS', JSON.stringify(board, null, 2))
      await redisClient.setEx(
        cacheKey,
        CACHE_TTL.BOARD,
        JSON.stringify(board)
      )


      return res.status(200).json({
        success: true,
        board
      })
    } catch (error) {
      next(error)
    }
  },

  getBoardPinsByUsernameAndName: async (req, res, next) => {
    try {

      const { username, boardName } = req.params

      // Check if user exist
      const user = await User.findOne({
        where: { username: username }
      })

      if (!user) {
        return res.status(400).json('User not Found')
      }

      const board = await Board.findOne({
        where: { name: boardName, user_id: user.id },
        include: [
          {
            model: Pin,
            as: 'pins',
            through: { attributes: [] }, // Exclude junction table attributes
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar_url']

              }
            ]
          }
        ]
      })

      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Board not found'
        })
      }

      // console.log('BOARD BY USERNAME AND BOARDNAME', JSON.stringify(board, null, 2))

      return res.status(200).json({
        success: true,
        board
      })

    } catch (error) {
      next(error)
    }
  },

  // Add a pin to a board
  addPinToBoard: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { boardId, pinId } = req.body

      // Verify board belongs to user
      const board = await Board.findOne({
        where: { id: boardId, user_id: userId }
      })

      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Board not found or unauthorized'
        })
      }

      // Verify pin exists
      const pin = await Pin.findByPk(pinId)
      if (!pin) {
        return res.status(404).json({
          success: false,
          message: 'Pin not found'
        })
      }

      // Add pin to board using the association method
      // This uses the automatically generated addPin method
      // from Board.belongsToMany(Pin, {as: 'pins'})
      // const b =  await board.addPin(pin) // doesnt update board cover image with new pin

      // Method 2: Directly create the junction record to ensure hooks run
      // const BoardPin = sequelize.models.BoardPin
      await BoardPin.create({
        board_id: board.id,
        pin_id: pin.id
      })

      await Promise.all([
        // Clear board, boards
        redisClient.del(CACHE_KEYS.board(board.id)),
        redisClient.del(CACHE_KEYS.userBoards(req.user.id)),
      ])
      // Update the board's cover image with this pin
      // This is optional since the hook will handle it,
      // but gives you more control
      //   await board.updateCoverImage(pinId)

      return res.status(200).json({
        success: true,
        message: 'Pin added to board successfully'
      })
    } catch (error) {
      next(error)
    }
  },

  // Remove a pin from a board
  removePinFromBoard: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { boardId, pinId } = req.params

      // Verify board belongs to user
      const board = await Board.findOne({
        where: { id: boardId, user_id: userId }
      })

      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Board not found or unauthorized'
        })
      }

      // Remove pin from board using the association method
      // This uses the automatically generated removePin method
      // from Board.belongsToMany(Pin, {as: 'pins'})
      await board.removePin(pinId)

      return res.status(200).json({
        success: true,
        message: 'Pin removed from board successfully'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = boardController