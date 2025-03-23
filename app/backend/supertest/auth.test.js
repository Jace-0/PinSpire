/* AUTHENTICATION INTEGRATION TEST */

/* TEST NOTE:
These tests are intentionally not isolated from each other. They run in sequence and depend on the state created by previous tests. This approach was chosen to avoid cleaning up the database between each test, which improves test execution speed. However, this means:

1. Tests must be run in the specified order
2. Test failures may cascade (a failure in an early test may cause later tests to fail)
3. Debugging individual tests may require running preceding tests first

TODO: Consider refactoring to use isolated tests with proper setup/teardown if test maintenance becomes difficult.
*/


// const logger = require('../util/logger')
const { test, before, after, describe } = require('node:test')
const assert = require('node:assert')
const jwt = require('jsonwebtoken')
const { connectRedis, disconnectRedis, redisClient } = require('../util/redis')
const { sequelize } = require('../util/db')


const {
  reset,
  createUser,
  loginUser,
  refreshToken,
  logout,
} = require('./test_helper')

const testUsers = {
  JACE: {
    email: 'jace@test.com',
    password: 'Test123!@#',
    dob: '2001-01-01'
  },
  invalid: {
    email: 'invalid@example.com',
    password: '123',
    dob: 'invalid-date'
  },
  MATTI : {
    email: 'matti@test.com',
    password: 'salenen',
    dob: '2001-01-02'
  }
}
let JACE, JACE_TOKENS



describe('Authentication Tests', async () => {
  before(async () => {
    await connectRedis()
    await sequelize.authenticate()

    // Clean Database
    await reset()
  })

  after(async () => {
    await disconnectRedis()
    await sequelize.close()
  })

  test('Successfully creates new user with valid data', async () => {
    const response = await createUser(testUsers.JACE)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    JACE = response.body.user
    JACE_TOKENS = {
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken
    }
    // Verify response structure
    assert.ok(response.body.user, 'Response should contain user object')
    assert.ok(response.body.accessToken, 'Response should contain access token')
    assert.ok(response.body.refreshToken, 'Response should contain refresh token')

    // Verify user data
    const { user } = response.body
    assert.ok(user.id, 'User should have an ID')
    assert.ok(user.username, 'User should have a username generated by the system from email')
    assert.ok(!user.password, 'Password should not be returned')
  })


  test('Prevents duplicate user registration', async () => {
    // Attempt duplicate registration
    const response = await createUser(testUsers.JACE)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    assert.equal(response.body.error, 'Email already exists')
  })

  test('Validates required fields', async () => {
    const invalidUsers = [
      { password: 'test123', dob: '2001/1/1' }, // Missing email
      { email: 'test@example.com', dob: '2001/1/1' }, // Missing password
      { email: 'test@example.com', password: 'test123' } // Missing dob
    ]

    for (const invalidUser of invalidUsers) {
      const response = await createUser(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert.ok(response.body.error, 'Should return error message')
      assert.equal(response.body.error, 'Email, password and date of birth are required')
    }
  })

  test('Successfully logs in with valid credentials', async () => {
    const credentials = {
      email: testUsers.JACE.email,
      password: testUsers.JACE.password
    }

    const response = await loginUser(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    // Verify response structure
    assert.ok(response.body.user, 'Response should contain user object')
    assert.ok(response.body.accessToken, 'Response should contain access token')
    assert.ok(response.body.refreshToken, 'Response should contain refresh token')

    // Verify user data
    const { user } = response.body
    assert.ok(!user.password, 'Password should not be returned')

  })

  test('Rejects invalid credentials', async () => {
    const invalidCredentials = [
      { email: testUsers.JACE.email, password: testUsers.invalid.password },
      { email: testUsers.invalid.email, password: testUsers.JACE.password }
    ]

    for (const credentials of invalidCredentials) {
      const response = await loginUser(credentials)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      assert.equal(response.body.error, 'Invalid credentials')
    }
  })

  test('Successfully refreshes access token', async () => {
    const response = await refreshToken()
      .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
      .send({ refreshToken: JACE_TOKENS.refreshToken })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    // Verify response
    assert.ok(response.body.accessToken, 'Should return new access token')
    assert.ok(response.body.refreshToken, 'Should return new refresh token')
    assert.notEqual(
      response.body.accessToken,
      JACE_TOKENS.accessToken,
      'New access token should be different'
    )
    assert.notEqual(
      response.body.refreshToken,
      JACE_TOKENS.refreshToken,
      'New refresh token should be different'
    )


    // Check if new token is not blacklisted
    const isNotBlacklisted = await redisClient.get(`bl_${response.body.refreshToken}`)
    assert.equal(isNotBlacklisted, null, 'New token should not be blacklisted')

    // Updated JACE Tokens
    JACE_TOKENS = {
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken
    }

  })

  test('Rejects invalid token formats', async () => {
    // JWT will return 401 for these cases
    const invalidTokens = [
      'not-a-token',
      'invalid.jwt.format',
      `${JACE_TOKENS.refreshToken}corrupted`
    ]

    for (const invalidToken of invalidTokens) {
      await refreshToken()
        .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
        .send({ refreshToken: invalidToken })
        .expect(401)  // JWT verification fails with 401
        .expect('Content-Type', /application\/json/)
    }
  })

  test('Rejects blacklisted valid format tokens', async () => {
    // First use valid tokens
    const newTokens = await refreshToken()
      .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
      .send({ refreshToken: JACE_TOKENS.refreshToken })
      .expect(200)


    // Try to reuse the now-blacklisted token
    const blacklistedResponse = await refreshToken()
      .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
      .send({ refreshToken: JACE_TOKENS.refreshToken })
      .expect(400)  // Blacklisted token returns 400
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(
      blacklistedResponse.body.error,
      'Token has been revoked',
      'Should reject blacklisted token'
    )

    // Verify Token is Blacklisted on redis
    const isBlacklisted = await redisClient.get(`bl_${JACE_TOKENS.refreshToken}`)
    assert.equal(isBlacklisted, 'true', 'Old token should be blacklisted')

    // Updated JACE Tokens
    JACE_TOKENS = {
      accessToken: newTokens.body.accessToken,
      refreshToken: newTokens.body.refreshToken
    }
  })

  test('Accepts request with NO Authorization header Reject with non', async () => {

    // Try with NO Authorization Header
    const newTokens = await refreshToken()
      .set('Authorization', 'Bearer invalid-accessToken')
      .send({ refreshToken: JACE_TOKENS.refreshToken })
      .expect(200)  // when accessToken is no longer valid, or expired

    // Updated JACE Tokens
    JACE_TOKENS = {
      accessToken: newTokens.body.accessToken,
      refreshToken: newTokens.body.refreshToken
    }


    // Try with NO refresh Token
    const noTokenResponse = await refreshToken()
      .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
      .expect(400)

    assert.ok(noTokenResponse.body.error)
    assert.equal(noTokenResponse.body.error, 'No token', 'Should respond with No Token' )
  })

  test('Rejects expired refresh tokens', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { id: JACE.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '0s' }
    )

    await refreshToken()
      .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
      .send({ refreshToken: expiredToken })
      .expect(401)  // Expired tokens return 401
      .expect('Content-Type', /application\/json/)
  })


  test('Successfully Log out and access token blacklisted ', async () => {

    const response = await logout()
      .set('Authorization', `Bearer ${JACE_TOKENS.accessToken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.equal(response.body.message, 'Logged out successfully' )

    //  check if token is blacklisted
    const isBlacklisted = await redisClient.get(`bl_${JACE_TOKENS.accessToken}`)
    assert.equal(isBlacklisted, 'true', 'Token should be blacklisted')

  })

})
