const http = require('http')
const path = require('path')

const express = require('express')
const cors = require('cors')

const WebSocketServer = require('./util/websocket')
const { connectToDatabase, sequelize } = require('./util/db')
const { redisClient, connectRedis, disconnectRedis } = require('./util/redis')
const logger = require('./util/logger')

// middleware
const middleware = require('./middleware/middleware')
const routes = require('./routes/index')

class Server {
  constructor() {
    this.app = express()
    this.server = null
    this.wsServer = null

    // Initialize core middleware
    this.initializeMiddleware()

    // Initialize routes
    this.initializeRoutes()

    // Initialize error handling
    this.initializeErrorHandling()
  }

  // Initialize core middleware
  initializeMiddleware() {
    // Parse JSON bodies
    this.app.use(express.json())

    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }))

    // Enable CORS
    this.app.use(cors())

    // Request logging
    this.app.use(middleware.requestLogger)

    // Security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      next()
    })

  }

  // Initialize routes
  initializeRoutes() {
    // Health check route
    this.app.get('/api/health', async (req, res) => {
      await sequelize.authenticate()
      await redisClient.ping()
      res.status(200).json({ status: 'ok' })
    })

    // Serve html
    this.app.use(express.static('build'))
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'))
    })

    // API routes
    this.app.use('/api', routes)
  }

  // Initialize error handling middleware
  initializeErrorHandling() {
    // Global error handler
    this.app.use(middleware.unknownEndpoint)
    this.app.use(middleware.errorHandler)
  }

  // Initialize HTTP server
  initHttpServer() {
    this.server = http.createServer(this.app)
    return this.server
  }

  // Initialize WebSocket server
  initWebSocket() {
    if (!this.server) {
      throw new Error('HTTP server must be initialized before WebSocket server')
    }
    this.wsServer = new WebSocketServer(this.server)
    this.app.ws = this.wsServer
    return this.wsServer
  }

  // Get WebSocket server instance
  getWsServer() {
    return this.wsServer
  }
  getWebSocketStatus() {
    if (!this.wsServer) {
      return {
        status: 'NOT_INITIALIZED',
        clientCount: 0,
        clients: []
      }
    }

    const clients = Array.from(this.wsServer.clients).map((ws, index) => ({
      id: index,
      state: ws.readyState,
      stateName: {
        [WebSocket.CONNECTING]: 'CONNECTING',
        [WebSocket.OPEN]: 'OPEN',
        [WebSocket.CLOSING]: 'CLOSING',
        [WebSocket.CLOSED]: 'CLOSED'
      }[ws.readyState]
    }))

    return {
      status: 'INITIALIZED',
      clientCount: this.wsServer.clients.size,
      clients
    }
  }

  // Start the server
  async start(port, enableWs = true) {
    try {
      await connectRedis()
      await connectToDatabase()

      if (!this.server) {
        this.initHttpServer()
      }

      if (enableWs) {
        this.initWebSocket()
      }

      return new Promise((resolve) => {
        this.server.listen(port, () => {
          logger.info(`Server running on port ${port}`)
          resolve(this.server)
        })
      })

    }catch (error) {
      logger.error('Error starting server:', error)
      throw error
    }

  }

  // Graceful shutdown
  async stop() {
    try {
      await disconnectRedis()
      await sequelize.close()

      if (this.wsServer) {
        await this.wsServer.shutdown()
      }

      if (this.server) {
        return new Promise((resolve) => {
          this.server.close(() => {
            logger.info('HTTP server closed')
            resolve()
          })
        })
      }

    } catch (error) {
      logger.error('Error during server shutdown:', error)
      // Force close everything if graceful shutdown fails
      if (this.wsServer) {
        for (const [ws] of this.wsServer.clients) {
          ws.terminate()
        }
        this.wsServer.close()
      }
      if (this.server) {
        this.server.close()
      }

      throw error
    }
  }

  // Get Express app instance
  getApp() {
    return this.app
  }
}

module.exports = Server