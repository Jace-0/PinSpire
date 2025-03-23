/* Integration Tests
 * - Profile Operations
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
const { connectRedis, disconnectRedis, redisClient } = require('../util/redis')
const { sequelize } = require('../util/db')

const {
  reset,
  createUser,
  updateUserProfileData,
  updateUserProfileAvatar,
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

let JACE, JACE_TOKENS


describe('User API Tests', async () => {
  before(async () => {
    try {
      await sequelize.authenticate()

      await connectRedis()
      // Clean Database
      await reset()

      const user = await createUser(testUsers.JACE)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      JACE = user.body.user
      JACE_TOKENS = {
        accessToken: user.body.accessToken,
        refreshToken: user.body.refreshToken
      }

    } catch (error) {
      logger.error('Database cleanup error', error)
      throw error
    }
  })

  after(async () => {
    try {
      await disconnectRedis()
      await sequelize.close()

      logger.info('Test database connection closed')
    } catch (error) {
      logger.error('Error closing database:', error)
      throw error
    }
  })

  describe('User Profile Update test', () => {
    test('should update user and return 200 status with updated data when valid updates provided', async () => {
      const updates = {
        first_name: 'Jace',
        last_name: 'Sam',
        bio: 'Software Developer',
        website_url: 'https://example.com',
        gender: 'male',
        country: 'CH',
        language: 'de'
      }

      const response = await updateUserProfileData()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send(updates)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const { success, data } = response.body

      delete data.created_at
      delete data.updated_at

      assert.ok(success)
      assert.deepStrictEqual(data, {
        ...updates,
        id: JACE.id,
        email: testUsers.JACE.email,
        username: JACE.username,
        dob: '2001-01-01', // Match the exact format returned by the database,
        avatar_url: JACE.avatar_url
      })
    })


    test('should remove sensitive fields from update object before processing', async () => {
      const updates = {
        first_name: 'Jace',
        password: 'NewSecret123!', // password is removed
        email: 'new@example.com', // email is removed,
      }

      const response = await updateUserProfileData()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send(updates)
        .expect(200)

      assert.ok(response.body.success)
      assert.ok(!response.body.data.password)
    })


    test('should invalidate redis cache after successful update', async () => {
      const updates = { first_name: 'Jace' }

      // Update user
      await updateUserProfileData()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send(updates)
        .expect(200)

      // Verify cache is invalidated
      const cachedData = await redisClient.get(`user${JACE.id}`)
      assert.equal(cachedData, null)
    })


    test('should handle empty update object gracefully', async () => {
      const response = await updateUserProfileData()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send({})
        .expect(400)

      assert.equal(response.body.error, 'No update data provided')
    })


    test('should ignore invalid field names in update object', async () => {
      const updates = {
        first_name: 'Jace',
        invalidField: 'Invalid Value'
      }

      const response = await updateUserProfileData()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send(updates)
        .expect(200)

      assert.ok(response.body.success)
      assert.equal(response.body.data.first_name, 'Jace')
      assert.ok(!response.body.data.invalidField)
    })


    test('should handle database errors gracefully', async () => {
      // Force a database error by passing invalid data type
      const updates = {
        username: null //  username doesn't accept null
      }

      const response = await updateUserProfileData()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send(updates)
        .expect(400)

      assert.strictEqual(response.body.error, 'Validation error')
      assert.strictEqual(response.body.details[0].field, 'username')
      assert.strictEqual(response.body.details[0].message, 'User.username cannot be null')
      assert.strictEqual(response.body.details[0].type, 'notNull Violation')

    })



    // Avatar update Test
    describe('User Avatar Update Tests', async () => {
      // profile Image path
      const testImagePath = path.join(__dirname, 'test-files/profile.jpeg')

      test('should update user avatar and return 200 when valid file and ID provided', async () => {

        const response = await updateUserProfileAvatar()
          .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
          .attach('avatar', testImagePath) // .attach() handles the FormData creation internally
          .expect(200)
          .expect('Content-Type', /application\/json/)

        assert.ok(response.body.success)
        assert.notStrictEqual(response.body.data.avatar_url, JACE.avatar_url)
      })



      test('should return user data without password_hash when update successful', async () => {

        const response = await updateUserProfileAvatar()
          .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
          .attach('avatar', testImagePath)
          .expect(200)

        assert.strictEqual(response.body.success, true)
        assert.ok(!response.body.data.password_hash)
        assert.ok(response.body.data.id)
        assert.ok(response.body.data.username)
      })

      test('should invalidate Redis cache when avatar update successful', async () => {
        await updateUserProfileAvatar()
          .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
          .attach('avatar', testImagePath)
          .expect(200)

        const isInvlidated = await redisClient.get(`user:${JACE.username}`)

        assert.equal(isInvlidated, null, 'User should Invalidated')
      })

      test('should return 400 when no image file provided', async () => {
        const response = await updateUserProfileAvatar()
          .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
          .expect(400)

        assert.strictEqual(response.body.success, false)
        assert.strictEqual(response.body.message, 'No image file provided')
      })

      test('should handle missing file', async () => {
        const response = await updateUserProfileAvatar()
          .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
          .expect(400)

        assert.strictEqual(response.body.success, false)
        assert.strictEqual(response.body.message, 'No image file provided')
      })

    })
  })
})