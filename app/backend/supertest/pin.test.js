/*
 Integration Tests: Pin Management, Social Interaction Features & Notifications
Test Coverage:
  1. Pin Management
     - Pin creation and validation
     - Pin update operations
     - Pin deletion and cleanup

 2. Social Interactions
     - Pin likes/unlikes
     - Comment operations
       - Adding comments
       - Editing comments
       - Nested replies
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
const path = require('path')
const { Like, Comment } = require('../models/index')
const WebSocket = require('ws')
const { sequelize } = require('../util/db')


const {
  server,
  createUser,
  createPin,
  likePin,
  commentPin,
  likeComment,
  reset
} = require('./test_helper')


const testUsers = {
  JACE: {
    email: 'jace@test.com',
    password: 'Test123!@#2',
    username: 'jace',
    dob: '2001-01-01'
  },
  MATTI: {
    email: 'matti@tes.com',
    password: 'secret',
    username: 'matti',
    dob: '2001-01-02'
  }
}

let wsServer
let JACE, JACE_TOKENS
let MATTI, MATTI_TOKENS
let testPin
let jaceNotificationPayload
let jaceWsClient
let mattiNotificationPayload
let mattiWsClient


/* PIN INTEGRATION TEST  */
describe('Pin Test', () => {
  before(async () => {
    try {
      // Start the actual server for WebSocket testing
      wsServer = await server.start(0) // Port 0 for random available port
      const port = wsServer.address().port

      await sequelize.authenticate()


      // await connectRedis() // Connect Redis
      await reset() // Clean Database


      // Create test user (JACE)
      const userJace = await createUser(testUsers.JACE)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      JACE = userJace.body.user
      JACE_TOKENS = {
        accessToken: userJace.body.accessToken,
        refreshToken: userJace.body.refreshToken
      }

      // Create test user that will perform like, comment, like comment and comment reply operations (Matti Luukkainen)
      const userMatti = await createUser(testUsers.MATTI)
        .expect(201)

      MATTI = userMatti.body.user
      MATTI_TOKENS = {
        accessToken: userMatti.body.accessToken,
        refreshToken: userMatti.body.refreshToken
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
      logger.error('Database connection failed:', error)
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
      logger.error('Error closing database:', error)
      throw error
    }
  })


  // Test pin data
  const testImagePath = path.join(__dirname, 'test-files/dog.jpeg')
  const testPinInfo = {
    title: 'Puppy wearing a hat',
    description: 'Puppy puppy puppy puppy',
    external_url : 'https://nl.pinterest.com/pin/2181499815227379/',
    image_url: testImagePath
  }

  describe('Create pin Tests', () => {
    test('POST /api/pin - should create a new pin successfully', async () => {
      const response = await createPin()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .field('title', testPinInfo.title)
        .field('description', testPinInfo.description)
        .field('external_url', testPinInfo.external_url)
        .attach('image', testPinInfo.image_url)
        .expect(201)

      const { data } = response.body
      testPin = data // used as test pin for other interaction test
      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.message, 'Pin created successfully')
      assert.deepStrictEqual(data.title, testPinInfo.title)
      assert.equal(data.description, testPinInfo.description)
      assert.ok(data.image_url)
      assert.strictEqual(data.user.id, JACE.id)
    })

    test('POST /api/pin - should fail without authentication', async () => {

      try {
        //wrap in try/catch for some reason server connection reset 'ECONNRESET'
        const response = await createPin()
          .field('title', testPinInfo.title)
          .field('description', testPinInfo.description)
          .field('external_url', testPinInfo.external_url)
          .attach('image', testPinInfo.image_url)
          .expect(401)
          .expect('Content-Type', /application\/json/)

        logger.info('Response', response)
        assert.strictEqual(response.body.error, 'Please authenticate')
      }catch(error){
        logger.info('Error:', error)
      }

    })

    test('POST /api/pin - should fail without image', async () => {
      const response = await createPin()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .field('title', testPinInfo.title)
        .field('description', testPinInfo.description)
        .field('external_url', testPinInfo.external_url)
        // Intentionally not attaching image
        .expect(400)

      assert.strictEqual(response.body.success, false)
      assert.strictEqual(response.body.message, 'Pin image is required')
    })

    test('POST /api/pin - should fail with invalid data', async () => {

      const response = await createPin()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .field('title', '')
        .field('description', testPinInfo.description)
        .field('external_url', 'hello')
        .attach('image', testPinInfo.image_url)
        .expect(400)

      const { errors } = response.body


      assert.equal(response.body.success, false)
      assert.ok(response.body.errors)
      assert.strictEqual(errors[0].message, 'Title cannot be empty' )
      assert.strictEqual(errors[1].message, 'Invalid source URL format' )
    })

    test('POST /api/pins - should handle invalid image format', async () => {
      const testTextPath = path.join(__dirname, 'test-files/test.txt')

      const response = await createPin()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .field('title', '')
        .field('description', testPinInfo.description)
        .field('external_url', 'hello')
        .attach('image', testTextPath)
        .expect(400)

      assert.strictEqual(response.body.error, 'Only images are allowed')
    })

  })

  describe('Like Pin Tests', () => {

    test('POST /api/pin/:id/like - should like a pin successfully and recieve Like Notification through Websocket in real-time', async () => {

      // IF SAME USER WHO CREATED THE PIN LIKES IT,  (Server won't send notification)
      const response = await likePin(testPin.id) // created by jace
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`)
        .expect(200)

      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.liked, true)
      assert.strictEqual(response.body.message, 'Pin liked successfully')


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
      assert.strictEqual(jaceNotificationPayload.data.data.type, 'Like') // Like action
      assert.strictEqual(jaceNotificationPayload.data.data.content.username, MATTI.username, ' User name that performed action' )

      // Verify like was created in database
      const like = await Like.findOne({
        where: {
          user_id: MATTI.id,
          likeable_id: testPin.id,
          likeable_type: 'pin'
        }
      })

      assert.ok(like.dataValues.id, 'Like record should have a valid ID')
      assert.strictEqual(like.dataValues.likeable_id, testPin.id, 'Like record should reference the correct pin ID')
      assert.strictEqual(like.dataValues.user_id, MATTI.id, 'Like record should be associated with the correct user ID')
    })

    test('POST /api/pin/:id/like - should unlike a previously liked pin', async () => {
      // First like the pin
      await likePin(testPin.id)
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .expect(200)

      // Then try to like again (should unlike)
      const response = await likePin(testPin.id)
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .expect(200)

      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.liked, false)
      assert.strictEqual(response.body.message, 'Pin unliked successfully')

      // Verify like was removed from database
      const like = await Like.findOne({
        where: {
          user_id: JACE.id,
          likeable_id: testPin.id,
          likeable_type: 'pin'
        }
      })
      assert.strictEqual(like, null)
    })

    test('POST /api/pin/:id/like - should fail with non-existent pin or malformated pinId', async () => {
      const nonExistentPinId = 99999

      const response = await likePin(nonExistentPinId)
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .expect(400)

      assert.strictEqual(response.body.error, 'Invalid ID format', 'OR "pin not found" for malformated UUID, v4 specifically')
      assert.strictEqual(response.body.type, 'INVALID_ID')
    })

    test('POST /api/pin/:id/like - should fail without authentication', async () => {
      const response = await likePin(testPin.id)
        .expect(401)

      assert.strictEqual(response.body.error, 'Please authenticate' )
    })

  })

  let mattiComment
  describe('Comment Tests', () => {
    test('POST /api/pin/:id/comment - adds comment, returns comment with user details, and sends real-time notification to pin owner', async () => {
      const commentData = {
        content: 'Dogs are awesome creatures from Matti Luukkainen'
      }

      let pinId = testPin.id

      const response = await commentPin(pinId)
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`)
        .send(commentData)
        .expect(201)

      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.message, 'Comment added')

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

      // console.log('JaceNotification', JSON.stringify(jaceNotificationPayload, null, 2))

      // Verify notification payload
      assert.ok(jaceNotificationPayload , 'Should receive notification')
      assert.strictEqual(jaceNotificationPayload.type, 'notification')
      assert.strictEqual(jaceNotificationPayload.data.data.type, 'Comment') // Comment action
      assert.strictEqual(jaceNotificationPayload.data.data.content.username, MATTI.username, ' User name that performed action' )
      assert.strictEqual(jaceNotificationPayload.data.data.content.comment, commentData.content)

      // Verify comment was created in database
      const comment = await Comment.findOne({
        where: {
          pin_id: pinId,
          user_id: MATTI.id,
          content: commentData.content
        }
      })

      // console.log('COMMENT', JSON.stringify(comment, null, 2))
      mattiComment = comment.dataValues
      assert.ok(comment)
    })

    test('POST /api/pin/:id/comment - should fail with empty content', async () => {

      let pinId = testPin.id

      const commentData = {
        content: ''
      }

      const response = await commentPin(pinId)
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`)
        .send(commentData)
        .expect(400)

      assert.strictEqual(response.body.success, false)
      assert.strictEqual(response.body.message, 'Comment content is required')
    })

    test('POST /api/pin/:id/comment - should fail with non-existent pin', async () => {
      const nonExistentPinId = 99999
      const commentData = {
        content: 'This is a test comment'
      }

      const response = await commentPin(nonExistentPinId)
        .set('Authorization', `Bearer ${MATTI_TOKENS.accessToken}`)
        .send(commentData)
        .expect(400)

      assert.strictEqual(response.body.error, 'Invalid ID format', 'Not a valid UUID v4 specifically')
      assert.strictEqual(response.body.type, 'INVALID_ID')
    })

    test('POST /api/pin/:id/comment - should fail without authentication', async () => {

      let pinId = testPin.id

      const commentData = {
        content: 'This is a test comment'
      }

      const response = await commentPin(pinId)
        .send(commentData)
        .expect(401)

      assert.strictEqual(response.body.error, 'Please authenticate' )
    })
  })

  describe('Like Comment Tests', () => {
    // Like existing comment by Matti Lukkainen

    test('POST /api/comment/:commentId/like - should like a comment successfully and send Comment Like Notification throgh Websocket in real-time to comment owner', async () => {

      logger.info('Matti comment id', mattiComment.id)
      const response = await likeComment(mattiComment.id)
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .expect(200)

      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.liked, true)
      assert.strictEqual(response.body.message, 'Comment liked successfully')

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
      assert.ok(mattiNotificationPayload , 'Should receive notification')
      assert.strictEqual(mattiNotificationPayload.type, 'notification')
      assert.strictEqual(mattiNotificationPayload.data.data.type, 'LikeComment') // Like action
      assert.strictEqual(mattiNotificationPayload.data.data.content.username, JACE.username, ' User name that performed action' )
      assert.strictEqual(mattiNotificationPayload.data.data.content.pinId, testPin.id, 'Pin Id should match' )

      // Verify like was created in database
      const like = await Like.findOne({
        where: {
          user_id: JACE.id,
          likeable_id: mattiComment.id,
          likeable_type: 'comment'
        }
      })
      assert.ok(like)
    })

    test('POST /api/comment/:commentId/like - should unlike a previously liked comment', async () => {
      // Unlike previous liked the comment
      const response = await likeComment(mattiComment.id) // test comment from matti
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .expect(200)

      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.liked, false)
      assert.strictEqual(response.body.message, 'Pin unliked successfully')

      // Verify like was removed from database
      const like = await Like.findOne({
        where: {
          user_id: JACE.id,
          likeable_id: mattiComment.id,
          likeable_type: 'comment'
        }
      })
      assert.equal(like, null)
    })

    test('POST /api/comment/:commentId/like - should fail with non-existent comment', async () => {
      const nonExistentCommentId = 99999

      const response = await likeComment(nonExistentCommentId)
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .expect(400)

      assert.strictEqual(response.body.error, 'Invalid ID format', 'or (Comment not found) for malformatted UUID')
      assert.strictEqual(response.body.type, 'INVALID_ID', )
    })

    test('POST /api/comments/:commentId/like - should fail without authentication', async () => {
      const response = await likeComment(mattiComment.id)
        .expect(401)

      assert.strictEqual(response.body.error, 'Please authenticate')
    })
  })

  describe('Reply Comment Tests', () => {

    test('POST /api/comment/:id/comment - should add reply successfully and comment owner should recieve Comment Reply Notification through websocket in real-time', async () => {
      const replyData = {
        content: 'Thank you matti',
        parentId: mattiComment.id
      }

      const response = await commentPin(testPin.id)
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send(replyData)
        .expect(201)

      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.message, 'Comment added')


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
      assert.ok(mattiNotificationPayload , 'Should receive notification')
      assert.strictEqual(mattiNotificationPayload.type, 'notification')
      assert.strictEqual(mattiNotificationPayload.data.data.type, 'Reply') //  action
      assert.strictEqual(mattiNotificationPayload.data.data.content.username, JACE.username, ' User name that performed action' )
      assert.strictEqual(mattiNotificationPayload.data.data.content.pinId, testPin.id, 'Pin Id should match' )

      // Verify reply was created in database
      const reply = await Comment.findOne({
        where: {
          parent_id: mattiComment.id,
          user_id: JACE.id,
          content: replyData.content
        }
      })
      assert.ok(reply)
    })
    test('POST /api/comment/:id/comment - should fail with empty content', async () => {
      const replyData = {
        content: ''
      }

      const response = await commentPin(mattiComment.id)
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send(replyData)
        .expect(400)

      assert.strictEqual(response.body.success, false)
      assert.strictEqual(response.body.message, 'Comment content is required')
    })

    test('POST /api/comment/:id/comment - should fail with non-existent comment', async () => {
      const nonExistentCommentId = 99999
      const replyData = {
        content: 'Hey Mat'
      }

      const response = await commentPin(nonExistentCommentId)
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send(replyData)
        .expect(400)

      assert.strictEqual(response.body.error, 'Invalid ID format', 'or (Comment not found) for malformatted UUID')
      assert.strictEqual(response.body.type, 'INVALID_ID', )
    })

    test('POST /api/comment/:id/comment - should fail without authentication', async () => {
      const replyData = {
        content: 'Hey Mat'
      }

      const response = await commentPin(mattiComment.id)
        .send(replyData)
        .expect(401)

      assert.strictEqual(response.body.error, 'Please authenticate')
    })
  })
})
