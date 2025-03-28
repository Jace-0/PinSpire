// controllers/auth.controller.js
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { redisClient } = require('../util/redis')
// const logger = require('../util/logger')
const User = require('../models/user')
const { generateInitialAvatar } = require('../util/cloudinary')
const { v4: uuidv4 } = require('uuid')
const { CACHE_KEYS, } = require('../util/cache_KEY_TTL')

const generateUsername = async (email) => {
  // Get base username from email (before @)
  let baseUsername = email.split('@')[0]
  // Remove special characters and spaces
  baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, '')

  let username = baseUsername
  let counter = 1

  // Check if username exists, if so, add number until unique
  while (await User.findOne({ where: { username } })) {
    username = `${baseUsername}${counter}`
    counter++
  }

  return username
}

const authController = {

  // Login controller
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body
      const user = await User.findByEmail(email)

      // verify user and password
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      // Generate both tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '5h' }  // Short lived
      )

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }  // Longer lived
      )

      // Update last login
      await user.updateLastLogin()

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url

        },
        accessToken,
        refreshToken
      })

    } catch (error) {
      next(error)
    }
  },

  // Signup controller
  signup: async (req, res, next) => {
    try  {
      const { email, password, dob } = req.body

      // Validate required fields
      if (!email || !password || !dob) {
        return res.status(400).json({
          error: 'Email, password and date of birth are required'
        })
      }

      // Check if email already exists
      const existingUser = await User.findOne({
        where: { email }
      })

      if (existingUser) {
        return res.status(409).json({
          error: 'Email already exists'
        })
      }
      // const existingUser = await User.findOne({
      //     where: {
      //         [Op.or]: [{ email }, { username }]
      //     }
      // });

      // Generate unique username from email
      const username = await generateUsername(email)

      const avatarUrl = await generateInitialAvatar(username)


      // Hash password
      const password_hash = await bcrypt.hash(password, 10)

      // Create user
      const user = await User.create({
        email,
        username,
        password_hash,
        dob,
        avatar_url: avatarUrl,
        is_active: true
      })

      // Generate both tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      )

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url
        },
        accessToken,
        refreshToken
      })


    } catch (error) {
      next(error)
    }
  },

  // Refresh token controller
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken){
        return res.status(400).json({
          error: 'No token'
        })
      }
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)

      // Check if token is blacklisted
      const isBlacklisted = await redisClient.get(`bl_${refreshToken}`)
      if (isBlacklisted) {
        return res.status(400).json({ error : 'Token has been revoked' })
      }

      // 3. Generate new tokens
      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      )
      const now = Math.floor(Date.now() / 1000) // Current time in seconds

      const newRefreshToken = jwt.sign(
        {
          id: decoded.id,
          jti: uuidv4(),  // Add a unique token ID
          iat: now        // Explicitly set issued at time
        },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      // 4. Blacklist the old refresh token
      await redisClient.set(
        `bl_${refreshToken}`,
        'true',
        { EX: 7 * 24 * 60 * 60 } // Same as refresh token expiry
      )

      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      })

    } catch (error) {
      next(error)
    }
  },

  // Logout controller
  logout: async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '')

      // Clear user cache
      await Promise.all([
        redisClient.del(CACHE_KEYS.user(req.user.username)),
        redisClient.del(CACHE_KEYS.userPins(req.user.id)),
        redisClient.del(CACHE_KEYS.userLikedPins(req.user.id)),
      ])

      // Blacklist the token
      await redisClient.set(
        `bl_${token}`,
        'true',
        { EX: 3600 }
      )

      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = authController