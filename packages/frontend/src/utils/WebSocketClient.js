class WebSocketClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = 1000
    this.messageHandlers = new Map()

    this.connect()
  }

  connect() {
    const url = new URL(this.baseUrl)
    url.searchParams.append('token', this.token)
    console.log('Connecting to:', url.toString())

    // native websocket in browser
    this.ws = new WebSocket(url.toString())

    this.ws.onopen = () => {
      console.log('Connected to WebSocket server')
      this.reconnectAttempts = 0

      // periodic ping to keep connection alive
      this.pingInterval = setInterval(() => {
        this.sendMessage('ping', {})
      }, 25000)
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code)
      clearInterval(this.pingInterval)
      this.handleReconnection()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'pong') {
          this.sendMessage('pong', {})
          console.log('Client responded with pong')
        }

        if (message.type && this.messageHandlers.has(message.type)) {
          this.messageHandlers.get(message.type)(message)
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectTimeout * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  sendMessage(type, data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type,
        data
      }))
    } else {
      console.error('WebSocket is not connected')
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