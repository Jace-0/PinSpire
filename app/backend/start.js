const Server = require('./server')
const port = process.env.PORT || 3000
const logger = require('./util/logger')

const server = new Server()

// Start the server
server.start(port, true).catch(logger.error)

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.stop()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Error during shutdown:', err)
      process.exit(1)
    })
})

module.exports = server