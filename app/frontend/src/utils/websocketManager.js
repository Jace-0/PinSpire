import WebSocketClient from './WebSocketClient'

class WebSocketManager {
  static instance = null
  static subscribers = new Map()
  static token = null
  static monitorInterval = null

  static initialize(token) {

    // Don't reinitialize if instance exists with same token
    if (WebSocketManager.instance && WebSocketManager.token === token) {
      return WebSocketManager.instance
    }

    // Cleanup existing connection if token changed
    if (WebSocketManager.instance) {
      WebSocketManager.disconnect()
    }

    WebSocketManager.token = token
    if (!WebSocketManager.instance && token) {
      WebSocketManager.instance = new WebSocketClient('ws://localhost:3000/', token)

      // Initialize connection
      WebSocketManager.instance.connect()
    }
    return WebSocketManager.instance
  }

  static subscribe(type, handler) {
    if (!WebSocketManager.instance) {
      console.warn('WebSocket not initialized. Call initialize first.')
      return
    }

    // Add handler to WebSocket client
    WebSocketManager.instance.on(type, handler)

  }

  static getInstance() {
    return WebSocketManager.instance
  }

  static disconnect() {
    if (WebSocketManager.instance) {
      WebSocketManager.instance.close()
      WebSocketManager.instance = null
      WebSocketManager.token = null
      WebSocketManager.subscribers.clear()
    }
  }

  sendMessage(type, data) {
    console.log('Manager Type ', type)
    console.log('Manager Data ', data)
    if (!WebSocketManager.instance) {
      throw new Error('WebSocket not initialized')
    }
    WebSocketManager.instance.sendMessage(type, data)
  }

  static startMonitoringHandlers(interval = 5000) {
    setInterval(() => {
      const handlers = this.instance.getMessageHandler()
      console.group('WebSocket Handlers Monitor')
      console.log('Timestamp:', new Date().toISOString())
      console.log('Active Handlers:', handlers)
      console.log('Total Handlers:', Object.keys(handlers).length)
      console.groupEnd()
    }, interval)

    console.log('Started monitoring WebSocket handlers')
  }

}

export default WebSocketManager


