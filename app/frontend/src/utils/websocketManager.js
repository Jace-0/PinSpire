import WebSocketClient from './WebSocketClient'
import logger from './logger'

class WebSocketManager {
  static instance = null
  static subscribers = new Map()
  static token = null
  static monitorInterval = null

  static getWsUrl() {
    return  process.env.NODE_ENV === 'production'
      ? process.env.APP_WS_URL
      : process.env.DEV_WS_URL
  }

  static initialize(token) {

    // Don't reinitialize if instance exists with same token
    if (WebSocketManager.instance && WebSocketManager.token === token) {
      return WebSocketManager.instance
    }

    // Cleanup existing connection if token changed
    if (WebSocketManager.instance) {
      WebSocketManager.disconnect()
    }

    const wsURL = this.getWsUrl()
    WebSocketManager.token = token
    if (!WebSocketManager.instance && token) {
      WebSocketManager.instance = new WebSocketClient(wsURL, token)

      // Initialize connection
      WebSocketManager.instance.connect()
    }
    return WebSocketManager.instance
  }

  static subscribe(type, handler) {
    if (!WebSocketManager.instance) {
      logger.warn('WebSocket not initialized. Call initialize first.')
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
      WebSocketManager.instance.isIntentionalClosure = true
      WebSocketManager.instance.close()
      WebSocketManager.instance = null
      WebSocketManager.token = null
      WebSocketManager.subscribers.clear()
    }
  }

  sendMessage(type, data) {
    if (!WebSocketManager.instance) {
      throw new Error('WebSocket not initialized')
    }
    WebSocketManager.instance.sendMessage(type, data)
  }

  static startMonitoringHandlers(interval = 5000) {
    setInterval(() => {
      const handlers = this.instance.getMessageHandler()
      /*
      console.group('WebSocket Handlers Monitor')
      console.log('Timestamp:', new Date().toISOString())
      console.log('Active Handlers:', handlers)
      console.log('Total Handlers:', Object.keys(handlers).length)
      console.groupEnd()
      */
    }, interval)

    // console.log('Started monitoring WebSocket handlers')
  }

}

export default WebSocketManager