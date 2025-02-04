require('dotenv').config()

const DATABASE_URL = process.env.NODE_ENV === 'test'
  ? process.env.TEST_POSTGRES_URL
  : process.env.POSTGRES_URL

const REDIS_URL = process.env.NODE_ENV === 'test'
  ? process.env.TEST_REDIS_URL
  : process.env.REDIS_URL


module.exports = {
  DATABASE_URL,
  REDIS_URL,
  PORT: process.env.PORT || 3000,
  SECRET: process.env.JWT_SECRET
}