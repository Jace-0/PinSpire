// controllers/user.controller.js
const { redisClient } = require('../util/redis')
// const logger = require('../util/logger')

const { uploadProfileImg } = require('../util/cloudinary')
const { User, Follower } = require('../models/index')
const { sequelize, Op } = require('../util/db')
const { CACHE_KEYS, CACHE_TTL } = require('../util/cache_KEY_TTL')

const invalidateUserRelatedCache = async (userId, username) => {
  try {
    // Get all cache keys that need to be invalidated
    const [feedKeys, likedKeys] = await Promise.all([
      redisClient.keys('pins:*'),         // All feed caches
      redisClient.keys(`user:${userId}:*`) // All user-related caches
    ])

    // Combine all keys that need to be deleted
    const keysToDelete = [
      CACHE_KEYS.user(username),           // User profile
      CACHE_KEYS.userPins(userId),       // User's pins
      CACHE_KEYS.userLikedPins(userId),      // User's liked pins
      ...feedKeys,                       // Feed caches
      ...likedKeys                       // Any other user-specific caches
    ]

    // Delete all keys in parallel
    await Promise.all(
      keysToDelete.map(key => redisClient.del(key))
    )

    // logger.info(`Cache invalidated for user ${userId}`)
  } catch (error) {
    // logger.error('Cache invalidation error:', error)
    throw new Error('Failed to invalidate cache', error)
  }
}

const userController = {
  // user controller
  getUserById: async (req, res, next) => {
    try {
      const userId = req.params.id

      // Check Redis cache
      const cacheKey = CACHE_KEYS.user(userId)
      const cachedData = await redisClient.get(cacheKey)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        return res.status(200).json({
          success: true,
          data: parsed.user,
          source: 'cache'
        })
      }

      // Find user by ID
      const user = await User.findById(userId)
      // .select('-password') // Exclude password from response
      // .lean(); // Convert to plain JS object

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Cache user data in Redis for future requests
      await redisClient.setEx(cacheKey, CACHE_TTL.USER, JSON.stringify({ user }))

      return res.status(200).json({
        success: true,
        data: user
      })

    } catch (error) {
      next(error)
    }
  },

  getUserByUsername: async (req, res, next) => {
    try {
      const username = req.params.username

      // Check Redis cache
      const cacheKey = CACHE_KEYS.user(username)
      const cachedData = await redisClient.get(cacheKey)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        return res.status(200).json({
          success: true,
          data: parsed.user,
          source: 'cache'
        })
      }

      const user = await User.findByUsername(username)

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Cache user data in Redis for future requests
      await redisClient.setEx(cacheKey, CACHE_TTL.USER, JSON.stringify({ user }))

      return res.status(200).json({
        success: true,
        source: 'database',
        data: user
      })

    } catch (error) {
      next(error)
    }
  },

  // Update user by ID
  updateUser: async (req, res, next ) => {
    try {
      const userId = req.user.id
      const updates = req.body

      // Check if updates object is empty
      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No update data provided'
        })
      }
      // Remove sensitive fields from updates
      delete updates.password
      delete updates.email // Prevent email changes through this endpoint
      delete updates.avatar_url // Prevent profile image changes through this endpoint

      // Perform update
      const [updated] = await User.update(updates, {
        where: { id: userId },
        returning: true
      })

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Get updated user data
      const updatedUser = await User.findByPk(userId, {
        attributes: {
          exclude: ['password_hash', 'location', 'last_login', 'is_verified', 'is_active','createdAt', 'updatedAt']
        }
      })

      // Invalidate all related caches
      await invalidateUserRelatedCache(userId, req.user.username)

      return res.status(200).json({
        success: true,
        data: updatedUser
      })

    } catch (error) {
      next(error)
    }
  },

  // Separate endpoint for avatar updates
  updateAvatar: async (req, res, next) => {

    // logger.info('File details:', {
    //   fieldname: req.file?.fieldname,    // 'avatar'
    //   originalname: req.file?.originalname, // original filename
    //   mimetype: req.file?.mimetype,      // e.g., 'image/jpeg'
    //   size: req.file?.size,              // file size in bytes
    //   bufferReceived: !!req.file?.buffer //  check if exists
    // })

    try {
      const userId = req.user.id
      const file = req.file


      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        })
      }

      // iF user Exist
      const user = await User.findOne({ where: { id: userId } })

      if (!user){
        return res.status(400).json({ Error: 'Not Found' })
      }

      // Upload to Cloudinary
      const imageUrl = await uploadProfileImg(file, userId, user.dataValues.username)

      // Update user's avatar_url
      const [updated] = await User.update({
        avatar_url: imageUrl
      }, {
        where: { id: userId },
        returning: true
      })

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Get updated user data
      const updatedUser = await User.findByPk(userId, {
        attributes: {
          exclude: ['password_hash']
        }
      })

      // Invalidate all related caches
      await invalidateUserRelatedCache(userId, req.user.username)


      return res.status(200).json({
        success: true,
        data: updatedUser
      })
    } catch (error) {
      next(error)
    }
  },

  followUser: async (req, res, next) => {
    try {
      const userId = req.user.id
      const followingId = req.params.id // ID of user to follow

      // check if user exist
      const followingUser = await User.findOne({ where: { id: followingId } })
      if (!followingUser){
        return res.status(404).json({ Error :'User does not Exist' })
      }

      const existingFollow = await Follower.findOne({
        where: {
          follower_id: userId,
          following_id: followingId
        },
      })

      if (existingFollow) {
        // unfollow if already followed
        await existingFollow.destroy()
        await redisClient.del(CACHE_KEYS.user(followingUser.username))
        await redisClient.del(CACHE_KEYS.user(req.user.username))
        return res.status(200).json({ message: 'Successfully unfollowed' })
      }

      await Follower.create({
        follower_id: userId, // ID of the user who is following (the current user)
        following_id: followingId //  ID of the user being followed
      })


      // Follow Notification
      if (followingId && followingId !== userId && req.app.ws) {
        req.app.ws.sendNotification(followingId, {
          type: 'notification',
          data: {
            type: 'Follow',
            content: {
              username: req.user.username,
            }
          }
        })
      }
      await redisClient.del(CACHE_KEYS.user(followingUser.username))
      await redisClient.del(CACHE_KEYS.user(req.user.username))

      res.status(200).json({ message: 'Successfully followed' })
    } catch (error) {
      next(error)
    }
  },

  checkFollowStatus: async (req, res, next) => {
    try {
      const userId = req.user.id
      const profileId = req.params.id

      const existingFollow = await Follower.findOne({
        where: {
          follower_id: userId,
          following_id: profileId
        }
      })

      res.status(200).json({ isFollowing: !!existingFollow })
    } catch (error) {
      next(error)
    }
  },

  searchUsers: async (req, res, next) => {
    try {
      const { username } = req.query

      if (!username?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        })
      }

      // Find users with similar usernames using ILIKE and pattern matching
      const users = await User.findAll({
        where: {
          [Op.or]: [
            // Match username containing the search term
            { username: { [Op.iLike]: `%${username}%` } }
          ]
        },
        attributes: ['id', 'first_name', 'last_name', 'username', 'avatar_url'],
        order: [
          // Exact matches first, then partial matches
          [sequelize.literal(`username ILIKE '${username}%'`), 'DESC'],
          ['username', 'ASC']
        ]
      })

      // Format response
      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        name: `${user.first_name} ${user.last_name}`,
        avatar_url: user.avatar_url
      }))


      return res.status(200).json({
        success: true,
        data: formattedUsers
      })

    } catch (error) {
      next(error)
    }
  }
}


module.exports = userController