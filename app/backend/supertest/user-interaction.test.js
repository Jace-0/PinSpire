/* Integration Tests: User Management & Social Features
 * - Follow Relationships and Notifications
 * - WebSocket Communications
 */

/* TEST NOTE:
These tests are intentionally not isolated from each other. They run in sequence and depend on the state created by previous tests. This approach was chosen to avoid cleaning up the database between each test, which improves test execution speed. However, this means:

1. Tests must be run in the specified order
2. Test failures may cascade (a failure in an early test may cause later tests to fail)
3. Debugging individual tests may require running preceding tests first

TODO: Consider refactoring to use isolated tests with proper setup/teardown if test maintenance becomes difficult.
*/

const logger = require('../util/logger')
const { test, before, after, describe } = require('node:test')
const assert = require('node:assert')
const WebSocket = require('ws')
const { sequelize } = require('../util/db')



const {
  server,
  createUser,
  followUser,
  checkFollowStatus,
  createChat,
  sendMessage,
  reset,
  expressApp,
} = require('./test_helper')



const testUsers = {
  JACE: {
    email: 'jace@test.com',
    password: 'Test123!@#4',
    dob: '2001-01-01'
  },
  invalid: {
    email: 'invalid@example.com',
    password: '123',
    dob: 'invalid-date'
  },
  MATTI : {
    email: 'matti@tes.com',
    password: 'salenen',
    dob: '2001-01-02'
  }
}

let wsServer
let JACE, JACE_TOKENS
let MATTI, MATTI_TOKENS
let jaceNotificationPayload
let jaceWsClient
let mattiNotificationPayload
let mattiWsClient

describe('User interaction test ', () => {
  before(async () => {
    try {

      // Start the actual server for WebSocket testing
      wsServer = await server.start(0) // Port 0 for random available port
      const port = wsServer.address().port
      await sequelize.authenticate()

      // await connectRedis() // Connect Redis
      await reset() // Clean Database

      // target user (who will receive notification)
      const targetResponse  = await createUser(testUsers.JACE)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      JACE = targetResponse.body.user
      JACE_TOKENS = {
        accessToken: targetResponse.body.accessToken,
        refreshToken: targetResponse.body.refreshToken
      }

      // Create a follower user for testing Notification and chat functionality
      const user = await createUser(testUsers.MATTI)
        .expect(201)

      MATTI = user.body.user
      MATTI_TOKENS = {
        accessToken: user.body.accessToken,
        refreshToken: user.body.refreshToken
      }

      // Initialize WebSocket client for user (JACE)
      jaceWsClient = new WebSocket(
        `ws://localhost:${port}?token=${JACE_TOKENS.accessToken}`
      )

      // Initialize WebSocket client for user (MATTI)
      mattiWsClient = new WebSocket(
        `ws://localhost:${port}?token=${MATTI_TOKENS.accessToken}`
      )

      // WebSocket connection handling...
      await Promise.race([
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'))
          }, 5000)

          let connectedClients = 0
          const checkBothConnected = () => {
            connectedClients++
            if (connectedClients === 2) {
              logger.info('Both clients connected')
              clearTimeout(timeout)
              resolve()
            }
          }

          jaceWsClient.on('open', checkBothConnected)
          mattiWsClient.on('open', checkBothConnected)

          jaceWsClient.on('error', (error) => {
            clearTimeout(timeout)
            reject(error)
          })

          mattiWsClient.on('error', (error) => {
            clearTimeout(timeout)
            reject(error)
          })
        }),

        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000)
        )
      ])

      // Message handlers
      jaceWsClient.on('message', (data) => {
        logger.info('Jace Received notification:', data.toString())
        jaceNotificationPayload = JSON.parse(data)
      })

      mattiWsClient.on('message', (data) => {
        logger.info('Matti Received notification:', data.toString())
        mattiNotificationPayload = JSON.parse(data)
      })


    } catch (error) {
      logger.error('Database cleanup error', error)
      throw error
    }
  })

  after(async () => {
    try {
      await sequelize.close()

      // Stop the server
      await server.stop()

      // logger.info(server.getWebSocketStatus())
    } catch (error) {
      logger.error('Error closing server:', error)
      throw error
    }
  })

  /*  FOLLOW & UNFOLLOW TEST */
  describe('Follow User Test - WebSocket Notification Integration Test', () => {
    test('should successfully follow a user when not already following -  receive follow notification through WebSocket', async () => {

      // Matti follows Jace, jace recieves follow notification
      const response = await followUser(JACE.id) // targetUserId to follow
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`)
        .expect(200)

      assert.strictEqual(response.body.message, 'Successfully followed')


      // verify (Jace) recieves Follow notification in real-time

      // Wait for notification with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('No notification received after 5s'))
        }, 5000)

        const checkInterval = setInterval(() => {
          if (jaceNotificationPayload ) {
            clearInterval(checkInterval)
            clearTimeout(timeout)
            resolve()
          }
        }, 100)
      })

      // Verify notification payload
      assert.ok(jaceNotificationPayload , 'Should receive notification')
      assert.strictEqual(jaceNotificationPayload.type, 'notification')
      assert.strictEqual(jaceNotificationPayload.data.data.type, 'Follow') // Follow action
      assert.strictEqual(jaceNotificationPayload.data.data.content.username, MATTI.username, ' User name that performed action' )

      // Verify follower relationship status between users
      const isFollowed = await checkFollowStatus(JACE.id)
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`)
        .expect(200)

      assert.strictEqual(isFollowed.body.isFollowing, true)

    })

    test('should successfully unfollow when already following user - no Notification', async () => {

      // Verify follower relationship status between users
      const isFollowed = await checkFollowStatus(JACE.id)
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`) // second user access token
        .expect(200)

      assert.strictEqual(isFollowed.body.isFollowing, true)

      // CLICK THE FOLLOWING BUTTON ON UI, AUTOMATICALLY UNFOLLOW THE TARGET USER

      const unfollowResponse = await followUser(JACE.id) // targetUserId to unfollow
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`)
        .expect(200)

      assert.strictEqual(unfollowResponse.body.message, 'Successfully unfollowed')


      // VERIFY UNFOLLOW STATUS
      const notFollowing = await checkFollowStatus(JACE.id)
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`) // second user access token
        .expect(200)

      assert.strictEqual(notFollowing.body.isFollowing, false)

    })
  })

  // CHAT INTEGRATION TEST
  describe('Chat WebSocket Integration Tests', () => {

    // let mattiMessagePayload = mattiNotificationPayload
    test('should handle real-time message exchange between users', async () => {

      // Initialize chat session between users
      const newChat = await createChat()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send({ otherUserId : MATTI.id }) // Id of Recipient
        .expect(201)

      // Verify chat creation
      assert.ok(newChat.body.id, 'Chat session should have a valid identifier')
      assert.strictEqual(
        newChat.body.user1_id,
        JACE.id,
        'Chat initiator should be recorded as user1'
      )
      assert.strictEqual(
        newChat.body.user2_id,
        MATTI.id,
        'Chat recipient should be recorded as user2'
      )
      assert.strictEqual(
        newChat.body.last_message_at,
        null,
        'New chat should have no message history'
      )

      // Send test message
      // JACE sends message to MATTI
      const newMessage = await sendMessage()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send({
          chat_id: newChat.body.id,
          content: 'mat i tried reaching you earlier.'
        })
        .expect(201)

      // Verify message sending
      assert.ok(newMessage.body.success, 'Message should be sent successfully')
      assert.strictEqual(
        newMessage.body.message,
        'Message sent successfully',
        'Server should confirm message delivery'
      )

      // Allow WebSocket connection to process message
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('No notification received after 5s'))
        }, 5000)

        const checkInterval = setInterval(() => {
          if (mattiNotificationPayload ) {
            clearInterval(checkInterval)
            clearTimeout(timeout)
            resolve()
          }
        }, 100)
      })

      // Verify message reception
      assert.ok(
        mattiNotificationPayload,
        'Recipient (matti) should receive real-time WebSocket message'
      )
      assert.deepStrictEqual(
        mattiNotificationPayload,
        {
          type: 'message_sent',
          data: {
            id: newMessage.body.data.id,
            chat_id: newMessage.body.data.chat_id,
            content: newMessage.body.data.content,
            sender_id: JACE.id,
            status: newMessage.body.data.status,
            created_at: newMessage.body.data.created_at,
            updated_at: newMessage.body.data.updated_at
          }
        },
        'WebSocket payload should match the sent message data'
      )
    })
  })

  test('Websocket should handle disconnection gracefully', async () => {
    // Wait for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 100))


    const wsServer = expressApp.ws
    // Store initial client count
    const beforeCount = wsServer.clients.size // 2
    logger.info('Before count', beforeCount)

    // Find Jace's client
    let foundClient = null
    wsServer.clients.forEach((client) => {
      if (client.userId === JACE.id) {
        foundClient = client
      }
    })

    // Verify we found the client
    assert.ok(foundClient, 'Client should be found before disconnection')
    assert.strictEqual(foundClient.userId, JACE.id, 'Client should have correct user ID')

    // Verify initial connection states
    assert.strictEqual(jaceWsClient.readyState, WebSocket.OPEN, 'jace wsClient.readyState should be OPEN (1)')
    assert.strictEqual(mattiWsClient.readyState, WebSocket.OPEN, 'matti wsClient.readyState should be OPEN (1)')

    server.close
    // Close Jace's client connection
    jaceWsClient.close()

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100))

    // Close Matti's client connection
    mattiWsClient.close()

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify connections are closed
    assert.notStrictEqual(jaceWsClient.readyState, WebSocket.OPEN, 'Jace WebSocket should be closed [wsClient.readyState should be 3, WebSocket.OPEN is 1]')
    assert.notStrictEqual(mattiWsClient.readyState, WebSocket.OPEN, 'Matti WebSocket should be closed [wsClient.readyState should be 3, WebSocket.OPEN is 1]')

    // Check if Jace's client was removed from server
    let clientFound = false
    wsServer.clients.forEach((client) => {
      if (client.userId === JACE.id) {
        clientFound = true
      }
    })

    assert.strictEqual(clientFound, false, 'Client should be removed from server')
    assert.strictEqual(
      wsServer.clients.size,
      beforeCount - 2,  // Both clients were closed
      'Client count should decrease by 2'
    )
  })
})