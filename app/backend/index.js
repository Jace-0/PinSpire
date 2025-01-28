const express = require('express')
const http = require('http')
require('express-async-errors')
const cors = require('cors')
const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const WebSocketServer = require('./util/websocket')

// Middleware imports
const sessionMiddleware = require('./middleware/session')
const { errorHandler } = require('./middleware/errorHandler')

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

// Middleware setup
app.use(cors())
app.use(express.json())
app.use(sessionMiddleware)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/pin', pinRoutes)
app.use('/api/chat', chatRouter)

// Error handling
app.use(errorHandler)

const start = async () => {
    await connectToDatabase()
    // await redisClient.connect()

    // Start HTTP server (which now includes WebSocket)
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log('Websocket Server is ready')
    })
  }

// Graceful shutdown
process.on('SIGTERM', () => { 
  console.log('SIGTERM signal received: closing server') 
  server.close(() => { console.log('Server closed') 
  process.exit(0) }) })

  
  start()