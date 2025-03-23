require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

const { sequelize } = require('../models')
const logger = require('../util/logger')

async function initializeDatabase() {
  try {
    logger.info('Starting database initialization...')

    // Test connection
    await sequelize.authenticate()
    logger.info('Database connection has been established successfully.')

    // Create tables based on models
    await sequelize.sync({ force: true })

    logger.info('Database initialization completed successfully')
    process.exit(0)
  } catch (error) {
    logger.error('Database initialization failed:', error)
    process.exit(1)
  }
}

initializeDatabase()