const express = require('express')
const http = require('http')
require('express-async-errors')
const cors = require('cors')
const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const WebSocketServer = require('./util/websocket')

const logger = require('./util/logger')

// Middleware imports
const sessionMiddleware = require('./middleware/session')
const middleware = require('./middleware/middleware')
// Route imports
const authRoutes = require('./routes/auth.router')
const userRoutes = require('./routes/user.router')
const pinRoutes = require('./routes/pin.router')
const chatRouter = require('./routes/chat.router')

const app = express()

// Create HTTP server
const server = http.createServer(app)

// Initialize WebSocket server
const wsServer = new WebSocketServer(server)

// Make WebSocket server available to routes
app.ws = wsServer


app.use(cors())
app.use(express.json())
app.use(sessionMiddleware)
app.use(middleware.requestLogger)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/pin', pinRoutes)
app.use('/api/chat', chatRouter)

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