import logger from '../utils/logger'
class WebSocketClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
    this.ws = null
    this.messageHandlers = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = 1000
    this.isIntentionalClosure = false
    this.pingInterval = null
    // this.connect()
  }

  connect() {
    const url = new URL(this.baseUrl)
    url.searchParams.append('token', this.token)

    // native websocket in browser
    this.ws = new WebSocket(url.toString())

    this.ws.onopen = () => {
      logger.info('Connected to WebSocket server')
      this.reconnectAttempts = 0

      // periodic ping to keep connection alive
      this.pingInterval = setInterval(() => {
        this.sendMessage('ping', {})
      }, 25000)
    }

    this.ws.onclose = (event) => {
      // logger.info('WebSocket connection closed:', event.code)
      clearInterval(this.pingInterval)
      // console.log('isIntentionalClosure', this.isIntentionalClosure)
      if (!this.isIntentionalClosure){
        this.handleReconnection()
      }
    }


    this.ws.onerror = (error) => {
      logger.error('WebSocket error:', error)
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'pong') {
          this.sendMessage('pong', {})
          // console.log('Client responded with pong')
        }

        // console.log('Message WS client', message)
        // console.log('Handlers', this.messageHandlers)

        if (message.type && this.messageHandlers.has(message.type)) {
          this.messageHandlers.get(message.type)(message)
        }
      } catch (error) {
        // console.error('Error parsing message:', error)
      }
    }
  }

  getMessageHandler() {
    return this.messageHandlers
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectTimeout * this.reconnectAttempts)
    } else {
      logger.error('Max reconnection attempts reached')
    }
  }

  sendMessage(type, data) {
    // console.log('Client TY', type)
    // console.log('Client DT', data)
    if (this.ws?.readyState === WebSocket.OPEN) {
      // console.log('Sent')
      this.ws.send(JSON.stringify({
        type,
        data
      }))
    } else {
      logger.error('WebSocket is not connected')
    }
  }

  on(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  close() {
    if (this.ws) {
      clearInterval(this.pingInterval)
      this.ws.close()
      this.ws = null
    }
  }

}

export default WebSocketClient