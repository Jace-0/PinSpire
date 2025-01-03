const express = require('express')
require('express-async-errors')
const cors = require('cors')
const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')

// Middleware imports
const sessionMiddleware = require('./middleware/session')
const { errorHandler } = require('./middleware/errorHandler')

// Route imports
const authRoutes = require('./routes/auth.router')
const userRoutes = require('./routes/user.router')
const pinRoutes = require('./routes/pin.router')

const app = express()


// Middleware setup
app.use(cors())
app.use(express.json())
app.use(sessionMiddleware)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/pin', pinRoutes)

// Error handling
app.use(errorHandler)

const start = async () => {
    await connectToDatabase()
    // await redisClient.connect()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  }
  
  start()