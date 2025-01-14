const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const redisClient = require('../util/redis')

class WebSocketServer {
  constructor(server) {
    // Initialize WebSocket server attached to HTTP server
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    this.init();
  }

  init() {
    // Handles new connection
    this.wss.on('connection', async (ws, request) => {
      try {
        // Authenticate the connection
        const userData = await this.authenticateConnection(ws, request);
        
        // Store client information
        this.clients.set(ws, {
            userId: userData.id,
            connectedAt: new Date(),
            isAlive: true
        });

        // client event handlers
        this.setupClientHandlers(ws);

      } catch (error) {
          ws.close(4001, 'Authentication failed');
      } 
    })

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
  })

  // Set up heartbeat to check for stale connections
  this.setupHeartbeat();
  }
  
  async sendNotification(userId, notification) {
    try {
      console.log('Notification Data', notification)
      // Find all connections for this user
      for (const [ws, clientData] of this.clients.entries()) {
        if (clientData.userId === userId && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'notification',
            data: notification
          }));
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async authenticateConnection(ws, request) {
    const token = this.extractToken(request);
    if (!token) {
        throw new Error('No token provided');
    }

    // Verify token isn't blacklisted
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
        throw new Error('Token is blacklisted');
    }

    // Verify JWT
    return jwt.verify(token, process.env.JWT_SECRET);
  }


  extractToken(request) {
    // Get token from query string
    const queryString = new URL(request.url, 'ws://localhost').searchParams;
    const queryToken = queryString.get('token');
    if (queryToken) return queryToken;

    // Get token from WebSocket protocol
    // const headerToken = request.headers['sec-websocket-protocol'];
    // return headerToken?.replace('Bearer ', '');
  }


  setupClientHandlers(ws) {
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            this.handleMessage(ws, data);
        } catch (error) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
      this.clients.delete(ws);
    });

  // Handle pong responses for connection monitoring
  ws.on('pong', () => {
      const clientData = this.clients.get(ws);
      if (clientData) {
          clientData.isAlive = true;
      }
  });
}

setupHeartbeat() {
  // Check client connections every 30 seconds
  setInterval(() => {
      this.clients.forEach((clientData, ws) => {
          if (!clientData.isAlive) {
              this.clients.delete(ws);
              return ws.terminate();
          }
          
          clientData.isAlive = false;
          ws.ping();
      });
  }, 30000);
}

handleMessage(ws, data) {
  // Get client information
  const clientData = this.clients.get(ws);
  if (!clientData) {
      return ws.close(4001, 'Client not found');
  }

  // Handle different message types
  switch (data.type) {
      case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      default:
          ws.send(JSON.stringify({ error: 'Unknown message type' }));
  }
}

// Utility method to broadcast to all connected clients
broadcast(message, excludeWs = null) {
  this.clients.forEach((_, ws) => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
      }
  });
}

}


module.exports = WebSocketServer;