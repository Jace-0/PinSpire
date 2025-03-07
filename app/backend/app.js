const express = require('express')
const http = require('http')
require('express-async-errors')
const cors = require('cors')
const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const WebSocketServer = require('./util/websocket')
const path = require('path')
const redisClient = require('./util/redis')
const { sequelize } = require('./util/db')

const logger = require('./util/logger')

// Middleware imports
// const sessionMiddleware = require('./middleware/session')
const middleware = require('./middleware/middleware')
// Route imports
const authRoutes = require('./routes/auth.router')
const userRoutes = require('./routes/user.router')
const pinRoutes = require('./routes/pin.router')
const chatRouter = require('./routes/chat.router')
const boardRouter = require('./routes/board.router')

const app = express()

// Create HTTP server
const server = http.createServer(app)

// Initialize WebSocket server
const wsServer = new WebSocketServer(server)

// Make WebSocket server available to routes
app.ws = wsServer

// process.env.FRONTEND_URL
app.use(cors({
  origin: true ,
  credentials: true
}))
app.use(express.json())
// app.use(sessionMiddleware) JWT
app.use(middleware.requestLogger)

app.get('/api/health', async (req, res) => {
  try {
    // Optional: Check database connection
    await sequelize.authenticate()
    // Optional: Check Redis connection
    await redisClient.ping()
    res.status(200).json({ status: 'healthy' })
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message })
  }
})

// Serve static frontend
app.use(express.static('build'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/pin', pinRoutes)
app.use('/api/chat', chatRouter)
app.use('/api/board', boardRouter)

if (process.env.NODE_ENV === 'test') {
  const testRouter = require('./routes/test.router')
  app.use('/api/test', testRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


/* START APP  */

const start = async () => {
  await connectToDatabase()
  // await redisClient.connect()

  // Start HTTP server (which now includes WebSocket)
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
    logger.info('Websocket Server is ready')
  })
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing server')
  server.close(() => { logger.info('Server closed')
    process.exit(0) }) })


module.exports = { start, app, server }