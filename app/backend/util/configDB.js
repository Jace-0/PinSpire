const config = {
  development: {
    url: process.env.POSTGRES_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    url: process.env.TEST_POSTGRES_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: false  // Disable SSL for test environment
    },
    logging: false // Disable logging in test environment
  },
  production: {
    url: process.env.POSTGRES_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Allows self-signed certificates
      }
    }
  }
}


// Get current environment or default to development
const env = process.env.NODE_ENV || 'development'

// Export the configuration for the current environment
module.exports = config[env]