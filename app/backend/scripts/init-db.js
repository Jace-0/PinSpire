require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

const { connectToDatabase } = require('../util/db')
const logger = require('../util/logger')

async function initializeDatabase() {
  try {
    logger.info('Starting database initialization...')
    await connectToDatabase()
    logger.info('Database initialization completed successfully')
    process.exit(0)
  } catch (error) {
    logger.error('Database initialization failed:', error)
    process.exit(1)
  }
}

initializeDatabase()