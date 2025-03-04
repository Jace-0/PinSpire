//  session management
// const session = require('express-session')
// const { RedisStore } = require('connect-redis')
// const redisClient = require('../util/redis')

// const sessionMiddleware = session({
//   // create new redis store
//   store: new RedisStore({
//     client: redisClient,
//     prefix: 'session:'
//   }),
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000
//   }
// })

// module.exports = sessionMiddleware