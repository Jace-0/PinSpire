const { redisClient } = require('../util/redis')
// const logger = require('../util/logger')
const { sequelize, Op } = require('../util/db')
const { validatePinData } = require('../validators/pin.validator')
const { Pin, Like, Comment, User, Board } = require('../models')
const { uploadPin } = require('../util/cloudinary')
const { CACHE_KEYS, CACHE_TTL } = require('../util/cache_KEY_TTL')


const getRepliesWithCTE = async (pinId) => {
  const allReplies = await sequelize.query(`
    WITH RECURSIVE reply_tree AS (
      -- Base case: Get all direct replies to comments
      SELECT 
        c.*,
        u.id as user_id,
        u.username,
        u.avatar_url,
        1 as depth,
        ARRAY[c.created_at] as reply_path,
        COALESCE((
          SELECT COUNT(*)
          FROM likes l
          WHERE l.likeable_id = c.id 
          AND l.likeable_type = 'comment'
        ), 0) as likes_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.pin_id = :pinId 
      AND c.parent_id IN (
        SELECT id FROM comments 
        WHERE pin_id = :pinId 
        AND parent_id IS NULL
      )

      UNION

      -- Recursive case: Get replies to replies
      SELECT 
        c.*,
        u.id as user_id,
        u.username,
        u.avatar_url,
        rt.depth + 1,
        rt.reply_path || c.created_at,
        COALESCE((
          SELECT COUNT(*)
          FROM likes l
          WHERE l.likeable_id = c.id 
          AND l.likeable_type = 'comment'
        ), 0) as likes_count
      FROM reply_tree rt
      JOIN comments c ON c.parent_id = rt.id
      LEFT JOIN users u ON c.user_id = u.id
    )
    SELECT DISTINCT ON (id) *
    FROM reply_tree
    ORDER BY id, depth, created_at ASC
  `, {
    replacements: { pinId },
    type: sequelize.QueryTypes.SELECT
  })

  return allReplies.map(reply => ({
    id: reply.id,
    content: reply.content,
    parent_id: reply.parent_id,
    pin_id: reply.pin_id,
    created_at: reply.created_at,
    updated_at: reply.updated_at,
    likes_count: parseInt(reply.likes_count),
    depth: reply.depth,
    user: {
      id: reply.user_id,
      username: reply.username,
      avatar_url: reply.avatar_url
    }
  }))
}

const pinController = {
  /* Get pin by id */
  getPinById: async (req, res, next) => {
    try {
      const pinId = req.params.id
      const cacheKey = CACHE_KEYS.pin(pinId)

      // Check Redis cache
      const cachedData = await redisClient.get(cacheKey)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        return res.status(200).json({
          success: true,
          data: parsed.pinData,
          source: 'cache'
        })
      }


      // Fetch pin with comments their replies, and replies to replies all in a flat structure under each comment
      const pin = await Pin.findOne({
        where: { id: pinId },
        attributes: {
          include: [
            // Get likes count
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM "likes"
                WHERE "likeable_id" = "Pin"."id"
              )`),
              'like_count'
            ],
            // Get comments count
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM "comments"
                WHERE "pin_id" = "Pin"."id"
                AND "parent_id" IS NULL
              )`),
              'comment_count'
            ]
          ]
        },
        include: [
          // Pin owner
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar_url']
          },
          // Top level comments
          {
            model: Comment,
            as: 'comments',
            where: { parent_id: null }, // Only get main comments
            required: false, // Show pin even without comments
            attributes: {
              include: [
                // Comment likes count
                [
                  sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM "likes"
                    WHERE "likeable_id" = "comments"."id" 
                    AND "likeable_type" = 'comment'
                  )`),
                  'likes_count'
                ],
                // Comment replies count
                [
                  sequelize.literal(`(
                SELECT COUNT(*)
                FROM "comments" AS replies
                WHERE replies.parent_id = "comments"."id"
              )`),
                  'replies_count'
                ]
              ]
            },
            include: [
              // Comment author
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar_url']
              },
              // All replies, reply to replies for this comment (flat structure)
              {
                model: Comment,
                as: 'replies',
                required: false,
                include: [
                  // Reply author
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url']
                  },
                ]
              },
            ]
          }
        ],
        order: [
          ['created_at', 'DESC'],
          [{ model: Comment, as: 'comments' }, 'created_at', 'DESC'],
          [{ model: Comment, as: 'comments' }, { model: Comment, as: 'replies' }, 'created_at', 'ASC']
        ]
      })


      if (!pin) {
        // Cache negative result with shorter TTL
        await redisClient.setEx(cacheKey, 300, JSON.stringify(null))
        return res.status(404).json({
          success: false,
          message: 'No Pin found'
        })
      }

      const pinData = pin.toJSON()

      // Get all replies using CTE if there are comments
      if (pinData.comments?.length > 0) {
        const allReplies = await getRepliesWithCTE(pinId)

        // Organize replies under their parent comments
        pinData.comments = pinData.comments.map(comment => ({
          ...comment,
          replies: allReplies.filter(reply => {
          // Get all replies in this comment's thread
            const isInThread = (replyId) => {
              const reply = allReplies.find(r => r.id === replyId)
              if (!reply) return false
              if (reply.parent_id === comment.id) return true
              return isInThread(reply.parent_id)
            }
            return isInThread(reply.id)
          }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        }))
      }

      // Example Structure
      /*
        // Before post-processing
        comment: {
          id: "comment1",
          content: "Nice shoes",
          replies: [
            { id: "reply1", parent_id: "comment1", content: "Thanks!" },
            { id: "reply2", parent_id: "reply1", content: "@user Still looking" },
            { id: "reply3", parent_id: "reply1", content: "@user Me too!" },
            { id: "reply4", parent_id: "reply3", content: "@user nevermind!" },
          ]
        }

        // After post-processing
        comment: {
          id: "comment1",
          content: "Nice shoes",
          replies: [
            {
              id: "reply1",
              parent_id: "comment1",
              content: "Thanks!",
              replies: [
                { id: "reply2", parent_id: "reply1", content: "@user Still looking" },
                { id: "reply3", parent_id: "reply1", content: "@user Me too!" }
                { id: "reply4", parent_id: "reply3", content: "@user nevermind!" }
              ]
            }
          ]
        }
      */

      // console.log('PIN DATA ORGANISED', JSON.stringify(pinData, null, 2))

      const cacheData = {
        pinData,
        metadata: {
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + CACHE_TTL.PIN * 1000).toISOString()
        }
      }

      await redisClient.setEx(
        cacheKey,
        CACHE_TTL.PIN,
        JSON.stringify(cacheData)
      )

      return res.status(200).json({
        success: true,
        data: pinData
      })

    } catch (error) {
      next(error)
    }
  },

  //  Create Pin
  createPin: async (req, res, next) => {
    try {
      const userId = req.user.id
      const pinData = req.body
      const pinImage = req.file

      if (!pinImage) {
        return res.status(400).json({
          success: false,
          message: 'Pin image is required'
        })
      }

      // Validate pin data
      const { error } = validatePinData(pinData)
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pin data',
          errors: error.details
        })
      }

      const pinUrl = await uploadPin(pinImage)
      // delete pinData.boardId

      // Create new pin
      const pin = await Pin.create({
        ...pinData,
        image_url: pinUrl,
        user_id: userId
      })


      // Method 1: Using the association method (might bypass hooks)
      // await board.addPin(pin)

      // Method 2: Directly create the junction record to ensure hooks run
      if (pinData.boardId){

        // Verify board belongs to user
        const board = await Board.findOne({
          where: { id: pinData.boardId, user_id: userId }
        })

        if (!board) {
          return res.status(404).json({
            success: false,
            message: 'Board not found or unauthorized'
          })
        }

        const BoardPin = sequelize.models.BoardPin
        await BoardPin.create({
          board_id: board.id,
          pin_id: pin.id
        })

        await Promise.all([
          redisClient.del(CACHE_KEYS.board(board.id)),
          redisClient.del(CACHE_KEYS.userBoards(req.user.id))
        ])
      }



      // Find all pin feed cache keys
      const feedKeys = await redisClient.keys('pins:*')

      // Invalidate all necessary caches
      await Promise.all([
      // Clear user's pin list
        redisClient.del(CACHE_KEYS.userPins(req.user.id)),
        // Board and Boards
        // Clear all feed caches
        ...feedKeys.map(key => redisClient.del(key))
      ])

      // Get pin with associations
      const pinWithDetails = await Pin.findByPk(pin.id, {
        attributes: {
          exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }]
      })

      return res.status(201).json({
        success: true,
        data: pinWithDetails,
        message: 'Pin created successfully'
      })

    } catch (error) {
      next(error)
    }
  },

  // Get users pin
  getUserPins : async (req, res, next) => {
    try {
      const userId = req.params.id
      const cacheKey = CACHE_KEYS.userPins(userId)

      // Check cache
      const cachedData = await redisClient.get(cacheKey)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        return res.status(200).json({
          success: true,
          data: parsed,
          source: 'cache'
        })
      }

      const userPins = await Pin.findAll({
        where: { user_id: userId },
        attributes: {
          exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar_url'],
          },
        ],
        order: [['created_at', 'DESC']]
      })

      // Cache the results
      await redisClient.setEx(
        cacheKey,
        CACHE_TTL.USER_PINS,
        JSON.stringify(userPins)
      )

      return res.status(200).json({
        success: true,
        ...userPins
      })

    } catch (error) {
      next(error)
    }
  },

  // Get all pin, pin feeed
  getAllPins : async (req, res, next) => {
    try {
      // Get cursor (last pin id from previous fetch)
      const { cursor, limit = 20 } = req.query
      const cacheKey = CACHE_KEYS.allPins(cursor, limit)

      //Check catch
      const cachedData = await redisClient.get(cacheKey)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        return res.status(200).json({
          success: true,
          ...parsed.data,
          metadata: parsed.metadata,
          source: 'cache'
        })
      }

      // Build query
      const query = {
        attributes: {
          exclude: ['updated_at', 'updatedAt']
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url'],
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit)
      }

      if (cursor && cursor !== 'null' && cursor !== 'undefined') {
        const cursorDate = new Date(cursor)
        if (!isNaN(cursorDate.getTime())) {
          query.where = {
            created_at: {
              [Op.lt]: cursorDate
            }
          }
        }
      }

      const pins = await Pin.findAll(query)

      // Get last pin's timestamp for next cursor
      const lastPin = pins[pins.length - 1]        // Get last pin from current batch
      const nextCursor = lastPin ? lastPin.created_at : null  // Get its timestamp

      const responseData = {
        pins,
        nextCursor,
        hasMore: pins.length === parseInt(limit)
      }


      // Cache with metadata
      const cacheData = {
        data: responseData,
        metadata: {
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 900 * 1000).toISOString() // 15 minutes
        }
      }

      // Shorter TTL for paginated data
      await redisClient.setEx(cacheKey, CACHE_TTL.ALL_PINS, JSON.stringify(cacheData))

      return res.status(200).json({
        success: true,
        ...responseData,
        source: 'database'
      })

    } catch (error) {
      next(error)
    }

  },

  // Create comment
  createComment : async (req, res, next) => {

    try{
      const pinId = req.params.id
      const { content, parentId = null } = req.body
      const userId = req.user.id

      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        })
      }

      // Check if pin exists
      const pin = await Pin.findByPk(pinId)
      if (!pin) {
        return res.status(404).json({
          success: false,
          message: 'Pin not found'
        })
      }

      // Extract mentions
      const mentions = content.match(/@(\w+)/g) || []
      const usernames = mentions.map(mention => mention.slice(1))

      // Find mentioned user IDs
      const mentionedUsers = await User.findAll({
        where: { username: usernames },
        attributes: ['id']
      })

      // Create comment
      const comment = await Comment.create({
        pin_id: pinId,
        user_id: userId,
        content,
        parent_id: parentId,
        mentioned_users: mentionedUsers.map(user => user.id)
      })


      // Invalidate related Redis caches
      await redisClient.del(CACHE_KEYS.pin(pinId))

      if (parentId) {
        // Send Reply Notification
        const parentComment = await Comment.findByPk(parentId)
        if (parentComment && parentComment.user_id !== userId && req.app.ws) {
          req.app.ws.sendNotification(parentComment.user_id, {
            type: 'notification',
            data: {
              type: 'Reply',
              content: {
                username: req.user.username,
                comment: content,
                pinId
              }
            }
          })
        }
      } else {
        // Send Comment Notification
        if ( pin.user_id && pin.user_id !== comment.user_id && req.app.ws) {
          //  the WebSocket server instance from app
          req.app.ws.sendNotification(pin.user_id, {
            type: 'notification',
            data: {
              type: 'Comment',
              content: {
                username: req.user.username,
                comment: comment.content,
                pinId: comment.pin_id
              }
            }
          })
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Comment added'
      })


    } catch (error) {
      next(error)
    }
  },

  // Like pin
  likePin: async (req, res, next) => {
    try {
      const userId = req.user.id
      const pinId = req.params.id

      // Check if pin exists with user association
      const pin = await Pin.findOne({
        where: { id: pinId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }]
      })

      if (!pin) {
        return res.status(404).json({
          success: false,
          message: 'Pin not found'
        })
      }

      // Check if user already liked the pin
      const existingLike = await Like.findOne({
        where: {
          user_id: userId,
          likeable_id: pinId
        }
      })

      if (existingLike) {
        // Unlike if already liked
        await existingLike.destroy()

        // Invalidate cache
        await redisClient.del(CACHE_KEYS.pin(pinId))

        return res.status(200).json({
          success: true,
          liked: false,
          message: 'Pin unliked successfully'
        })
      }

      // Create new like
      await Like.create({
        user_id: userId,
        likeable_id: pinId,
        likeable_type: 'pin'
      })

      // Send notification if the pin owner is not the liker
      if (pin.user && pin.user.id !== userId && req.app.ws) {
        //  the WebSocket server instance from app
        req.app.ws.sendNotification(pin.user.id, {
          type: 'notification',
          data: {
            type: 'Like',
            content: {
              username: req.user.username,
              pinTitle: pin.title,
              pinId: pin.id
            }
          }
        })
      }

      // Invalidate cache
      await redisClient.del(CACHE_KEYS.pin(pinId))

      return res.status(200).json({
        success: true,
        liked: true,
        message: 'Pin liked successfully'
      })

    } catch (error) {
      next(error)
    }
  },

  // Like a Comment
  likeComment: async (req, res, next) => {
    try {
      const userId = req.user.id
      const commentId = req.params.commentId


      // Check if comment exists
      const comment = await Comment.findByPk(commentId)
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        })
      }

      // Check if user already liked the comment
      const existingLike = await Like.findOne({
        where: {
          user_id: userId,
          likeable_id: commentId,
          likeable_type: 'comment'
        }
      })

      if (existingLike) {
        // Unlike if already liked
        await existingLike.destroy()

        // Invalidate cache
        await redisClient.del(CACHE_KEYS.pin(comment.pin_id))

        return res.status(200).json({
          success: true,
          liked: false,
          message: 'Pin unliked successfully'
        })
      }

      // Create new like
      const LL =  await Like.create({
        user_id: userId,
        likeable_id: commentId,
        likeable_type: 'comment'
      })

      console.log('COMMENT', JSON.stringify(LL, null, 2))

      // Notification to the Comment owner
      if (comment.user_id && comment.user_id !== userId && req.app.ws) {

        //  the WebSocket server instance from app
        req.app.ws.sendNotification(comment.user_id, {
          type: 'notification',
          data: {
            type: 'LikeComment',
            content: {
              username: req.user.username,
              comment: comment.content,
              pinId: comment.pin_id
            }
          }
        })

      }

      // Invalidate cache
      await redisClient.del(CACHE_KEYS.pin(comment.pin_id))


      return res.status(200).json({
        success: true,
        liked: true,
        message: 'Comment liked successfully'
      })

    } catch (error) {
      next(error)
    }
  },
  // get Liked Pin
  getLikedPins: async ( req, res ) => {
    const userId = req.user.id

    // check redis cache
    const cacheKey = CACHE_KEYS.userLikedPins(userId)
    const cachedData = await redisClient.get(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      return res.status(200).json({
        success: true,
        data: parsed.likedPins,
        source: 'cache'
      })
    }

    const likedPins = await Like.findAll({
      where: {
        user_id: userId,
        likeable_type: 'pin'
      },
      include: [{
        model: Pin,
        as: 'likeable',
        required: true,
        include: [{
          model : User,
          as: 'user',
          attributes:['id', 'username', 'avatar_url']
        }]
      }]
    })

    if (!likedPins || likedPins.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No pins liked yet'
      })
    }

    await redisClient.setEx(
      cacheKey,
      CACHE_TTL.LIKED_PINS,
      JSON.stringify({ likedPins })
    )

    return res.status(200).json({
      success: true,
      data: likedPins
    })
  }
}

module.exports = pinController