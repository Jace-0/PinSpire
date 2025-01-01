const express = require('express')
require('express-async-errors')
const cors = require('cors')
const app = express()

// Config imports
const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const redisClient = require('./util/redis')
const sessionMiddleware = require('./middleware/session')

// Middleware imports
const { errorHandler } = require('./middleware/errorHandler')

// Route imports
const authRoutes = require('./routes/auth.routes')

// Middleware setup
app.use(cors())
app.use(express.json())
app.use(sessionMiddleware)

app.use('/api/auth', authRoutes)

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