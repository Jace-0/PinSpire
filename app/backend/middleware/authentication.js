// authentication middleware
// const logger = require('../util/logger')
const jwt = require('jsonwebtoken')
const { redisClient } = require('../util/redis')

const authentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) throw new Error('Authentication required')

    // Check if token is blacklisted in Redis
    const isBlacklisted = await redisClient.get(`bl_${token}`)
    if (isBlacklisted) throw new Error('Token is invalid')

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    next(error)
    // logger.error('Error', error)
    // res.status(401).json({ error: 'Please authenticate' })
  }
}

module.exports = authentication