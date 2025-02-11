const redisClient = require('../util/redis')
// const logger = require('../util/logger')
const { sequelize, Op } = require('../util/db')
const { validatePinData } = require('../validators/pin.validator')
const { Pin, Like, Comment, CommentReply, User } = require('../models')
const { uploadPin } = require('../util/cloudinary')

const CACHE_KEYS = {
  pin: (id) => `pin:${id}`,
  userPins: (userId) => `user:${userId}:pins`,
  allPins : (cursor, limit) =>  `pins:${cursor || 'latest'}:${limit}`,
  likedPins: (userId) => `user:${userId}:liked:pins`
}

const CACHE_TTL = {
  PIN: 3600,          // 1 hour
  USER_PINS: 3600,    // 1 hour
  RECENT_PINS: 1800,   // 30 minutes
  LIKED_PINS: 1600,
  ALL_PINS: 3600, // 1 hour
}

const pinController = {
  // pin controller
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


      // Fetch pin with associations and counts
      const pin = await Pin.findOne({
        where: { id: pinId },
        attributes: {
          include: [
            [
              sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "likes"
                                WHERE "likeable_id" = "Pin"."id"
                            )`),
              'like_count'
            ],
            [
              sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "comments"
                                WHERE "pin_id" = "Pin"."id"
                            )`),
              'comment_count'
            ]
          ]
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar_url']
          },
          {
            model: Like,
            as: 'likes',
            attributes: ['id', 'user_id'],
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar_url']
            }]
          },
          {
            model: Comment,
            as: 'comments',
            attributes: {
              include: [
                [
                  sequelize.literal(`(
                                        SELECT COUNT(*)
                                        FROM "likes"
                                        WHERE "likeable_id" = "comments"."id" 
                                        AND "likeable_type" = 'comment'
                                    )`),
                  'likes_count'
                ]
              ]
            },
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar_url']
            },
            {
              model: CommentReply,
              as: 'replies',
              attributes: ['id', 'user_id', 'content', 'created_at'],
              include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'avatar_url']
              }]
            }]
          },

        ],
        order: [
          ['created_at', 'DESC'],
          [{ model: Comment, as: 'comments' }, 'created_at', 'DESC'],
          [{ model: Comment, as: 'comments' }, { model: CommentReply, as: 'replies' }, 'created_at', 'DESC']
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

      // Transform data before caching
      const pinData = pin.toJSON()


      // Cache with metadata, NOT USED NOW
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

      // Create new pin
      const pin = await Pin.create({
        ...pinData,
        image_url: pinUrl,
        user_id: userId
      })

      // Invalidate related caches
      await Promise.all([
        redisClient.del(CACHE_KEYS.userPins(userId)),    // User's pins list
        // redisClient.del(CACHE_KEYS.allPins()),            // Pin feed list
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
          exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
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

  addComment : async (req, res, next) => {

    try{
      const userId = req.user.id
      const pinId = req.params.id
      const { content } = req.body

      console.log('NEW COMMENT YA', content, 'ID', pinId )

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

      // Create comment
      const comment = await Comment.create({
        pin_id: pinId,
        user_id: userId,
        content: content.trim()
      })

      if (pin.user_id && pin.user_id !== comment.userId && req.app.ws) {
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

      // Invalidate related Redis caches
      await Promise.all([
        redisClient.del(CACHE_KEYS.pin(pinId))
      ])

      // Get comment with user details
      const commentWithUser = await Comment.findOne({
        where: { id: comment.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }]
      })


      return res.status(201).json({
        success: true,
        data: commentWithUser,
        message: 'Comment added'
      })


    } catch (error) {
      next(error)
    }
  },

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
        await redisClient.del(`pin:${pinId}`)

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
      await redisClient.del(`pin:${pinId}`)

      return res.status(200).json({
        success: true,
        liked: true,
        message: 'Pin liked successfully'
      })

    } catch (error) {
      next(error)
    }
  },

  replyComment: async (req, res, next) => {
    try {
      const userId = req.user.id
      const commentId = req.params.commentId // From URL params
      const { content } = req.body

      // Validate content
      if (!content?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Reply content is required'
        })
      }

      // Check if comment exists
      const comment = await Comment.findByPk(commentId)
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        })
      }

      // Create reply
      const reply = await CommentReply.create({
        comment_id: commentId,
        user_id: userId,
        content: content.trim()
      })


      // Invalidate cache
      await redisClient.del(`pin:${comment.pin_id}`)

      // Get reply with user details
      const replyWithUser = await CommentReply.findOne({
        where: { id: reply.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }]
      })

      // Send notification if the Comment owner is not the replyer
      if (comment.user_id && comment.user_id !== replyWithUser.user.id && req.app.ws) {
        //  the WebSocket server instance from app
        req.app.ws.sendNotification(comment.user_id, {
          type: 'notification',
          data: {
            type: 'ReplyComment',
            content: {
              username: req.user.username,
              CommentReply: replyWithUser.content,
              pinId: comment.pin_id
            }
          }
        })
      }

      return res.status(201).json({
        success: true,
        data: replyWithUser,
        message: 'Reply added successfully'
      })

    } catch (error) {
      next(error)
    }
  },

  likeComment: async (req, res, next) => {
    try {
      const userId = req.user.id
      const commentId = req.params.commentId


      console.log('LIKE COMMENT', commentId )
      // Check if comment exists
      const comment = await Comment.findByPk(commentId)
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        })
      }

      console.log('Comment', comment.dataValues)

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
        await redisClient.del(`pin:${comment.pin_id}`)

        return res.status(200).json({
          success: true,
          liked: false,
          message: 'Pin unliked successfully'
        })
      }

      // Create new like
      await Like.create({
        user_id: userId,
        likeable_id: commentId,
        likeable_type: 'comment'
      })

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
      await redisClient.del(`pin:${comment.pin_id}`)


      return res.status(200).json({
        success: true,
        liked: true,
        message: 'Comment liked successfully'
      })

    } catch (error) {
      next(error)
    }
  },

  getLikedPins: async ( req, res ) => {
    const userId = req.user.id

    // check redis cache
    const cacheKey = CACHE_KEYS.likedPins(userId)
    const cachedData = await redisClient.get(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      return res.status(200).json({
        success: true,
        data: parsed,
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
      JSON.stringify(likedPins)
    )

    return res.status(200).json({
      success: true,
      data: likedPins
    })
  }
}

module.exports = pinController