const WebSocket = require('ws')
const jwt = require('jsonwebtoken')
const redisClient = require('../util/redis')
const { sequelize, Op } = require('../util/db')
const { Chat, Message } = require('../models')

const logger = require('./logger')

class WebSocketServer {
  constructor(server) {
    // Initialize WebSocket server attached to HTTP server
    this.wss = new WebSocket.Server({ server })
    this.clients = new Map()
    this.init()
  }

  init() {
    // Handles new connection
    this.wss.on('connection', async (ws, request) => {
      try {
        // Authenticate the connection
        const userData = await this.authenticateConnection(ws, request)

        // Store client information
        this.clients.set(ws, {
          userId: userData.id,
          connectedAt: new Date(),
          isAlive: true
        })

        // client event handlers
        this.setupClientHandlers(ws)

      } catch (error) {
        logger.error('Error', error)
        ws.close(4001, 'Authentication failed')
      }
    })

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error:', error)
    })

    // Set up heartbeat to check for stale connections
    this.setupHeartbeat()
  }

  async sendNotification(userId, notification) {
    try {
      // Find all connections for this user
      for (const [ws, clientData] of this.clients.entries()) {
        if (clientData.userId === userId && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'notification',
            data: notification
          }))
        }
      }
    } catch (error) {
      logger.error('Error sending notification:', error)
    }
  }

  async authenticateConnection(ws, request) {
    const token = this.extractToken(request)
    if (!token) {
      throw new Error('No token provided')
    }

    // Verify token isn't blacklisted
    const isBlacklisted = await redisClient.get(`bl_${token}`)
    if (isBlacklisted) {
      throw new Error('Token is blacklisted')
    }

    // Verify JWT
    return jwt.verify(token, process.env.JWT_SECRET)
  }


  extractToken(request) {
    // Get token from query string
    const queryString = new URL(request.url, 'ws://localhost').searchParams
    const queryToken = queryString.get('token')
    if (queryToken) return queryToken

    // Get token from WebSocket protocol
    // const headerToken = request.headers['sec-websocket-protocol'];
    // return headerToken?.replace('Bearer ', '');
  }


  setupClientHandlers(ws) {
    // Handle incoming messages
    ws.on('message', (message) => {
      try {

        const data = JSON.parse(message)
        this.handleMessage(ws, data)
      } catch (error) {
        logger.error('Error', error)
        ws.send(JSON.stringify({ error: 'Invalid message format' }))
      }
    })

    // Handle client disconnection
    ws.on('close', () => {
      this.clients.delete(ws)
    })

    // Handle pong responses for connection monitoring
    ws.on('pong', () => {
      const clientData = this.clients.get(ws)
      if (clientData) {
        clientData.isAlive = true
      }
    })
  }

  setupHeartbeat() {
  // Check client connections every 30 seconds
    setInterval(() => {
      this.clients.forEach((clientData, ws) => {
        if (!clientData.isAlive) {
          this.clients.delete(ws)
          return ws.terminate()
        }

        clientData.isAlive = false
        ws.ping()
      })
    }, 30000)
  }

  async handleMessage(ws, data) {

    // Get client information
    const clientData = this.clients.get(ws)
    if (!clientData) {
      return ws.close(4001, 'Client not found')
    }

    // Handle different message types
    switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }))
      break

    case 'send_message':
      try {
        const messageData  = data.data
        if (!messageData.chat_id || !messageData.content) {
          return ws.send(JSON.stringify({
            error: 'Invalid message format: missing chat_id or content'
          }))
        }

        await this.sendMessage({
          chat_id: messageData.chat_id,
          content: messageData.content,
          userId: clientData.userId
        })
      } catch (error) {
        ws.send(JSON.stringify({
          error: 'Failed to send message',
          message: error.message
        }))
      }
      break
    default:
      ws.send(JSON.stringify({ error: 'Unknown message type' }))
    }
  }

  async sendMessage({ chat_id, content, userId }) {

    // check if chat exist
    const chatExist = await Chat.findOne({
      where: {
        id: chat_id,
        [Op.or]: [
          { user1_id: userId },
          { user2_id: userId }
        ]
      }
    })

    if (!chatExist) {
      throw new Error('Chat not found or you are not a participant')
    }

    // Create message with transaction
    const message = await sequelize.transaction(async (t) => {
      const newMessage = await Message.create({
        chat_id: chatExist.id,
        sender_id: userId,
        content: content.trim(),
        status: 'sent'
      }, { transaction: t })

      // Update chat's last_message_at
      await Chat.update(
        { last_message_at: new Date() },
        {
          where: { id: chat_id },
          transaction: t
        }
      )
      return newMessage
    })



    // Send WebSocket message
    await this.sendChatMessage(
      {
        user1_id: chatExist.user1_id,
        user2_id: chatExist.user2_id
      },
      message
    )


  }

  // Utility method to broadcast to all connected clients
  broadcast(message, excludeWs = null) {
    this.clients.forEach((_, ws) => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      }
    })
  }

  async sendChatMessage(chatData, message) {
    try {
      const { user1_id, user2_id } = chatData
      const recipientIds = [user1_id, user2_id]

      // Send to both participants if they're online
      for (const [ws, clientData] of this.clients.entries()) {
        if (recipientIds.includes(clientData.userId) &&
          ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'message_sent',
            data: {
              id: message.id,
              chat_id: message.chat_id,
              content: message.content,
              sender_id: message.sender_id,
              created_at: message.created_at,
              status: message.status,
              updated_at: message.updated_at
            }
          }))
        }
      }
    } catch (error) {
      logger.error('Error sending chat message:', error)
    }
  }

}


module.exports = WebSocketServer