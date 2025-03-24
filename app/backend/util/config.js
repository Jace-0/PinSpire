require('dotenv').config()

let REDIS_URL
let DATABASE_URL


if (process.env.NODE_ENV === 'production') {
  REDIS_URL = process.env.RENDER_REDIS_URL
  DATABASE_URL =  process.env.POSTGRES_URL
}
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  REDIS_URL = process.env.TEST_REDIS_URL
  DATABASE_URL =  process.env.TEST_POSTGRES_URL
}


module.exports = {
  DATABASE_URL,
  REDIS_URL,
  PORT: process.env.PORT || 3000,
  SECRET: process.env.JWT_SECRET
}