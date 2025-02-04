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

redisClient.connect().catch(logger.error)

redisClient.on('error', (err) => logger.error('Redis Client Error', err))
redisClient.on('connect', () => logger.info('Redis Client Connected'))

module.exports = redisClient