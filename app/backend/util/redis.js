const Redis = require('redis')
const { REDIS_URL } = require('./config')
const logger = require('./logger')

const redisClient = Redis.createClient({
  url: REDIS_URL,
  legacyMode: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

// redisClient.connect().catch(logger.error)

redisClient.on('error', (err) => logger.error('Redis Client Error', err))
redisClient.on('connect', () => logger.info('Redis Client Connected'))
redisClient.on('end', () => logger.info('Redis Client Disconnected'))

const connectRedis = async () => {
  if (!redisClient.isReady) {
    try {
      await redisClient.connect()
    } catch (error) {
      logger.error('Redis connection error:', error)
      throw error
    }
  }
}

const disconnectRedis = async () => {
  if (redisClient.isReady) {
    try {
      await redisClient.quit()
      logger.info('Redis disconnected successfully')
    } catch (error) {
      logger.error('Redis disconnect error:', error)
      throw error
    }
  }
}

module.exports = {
  connectRedis,
  disconnectRedis,
  redisClient
}