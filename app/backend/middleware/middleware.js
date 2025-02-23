const logger = require('../util/logger')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
const errorHandler = (err, req, res, next) => {
  // logger.error('Error:', err.name, err.message)

  // Error log for debugging
  logger.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })

  if (res.headersSent) {
    return next(err)
  }

  // AUTH
  if (err.name === 'Error' ){
    if (err.message === 'Authentication required'){
      return res.status(401).json({ error: 'Please authenticate' })
    }
    if (err.message === 'Only images are allowed') {
      return res.status(400).json({ error: 'Only images are allowed' })
    }
  }


  // Handle Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError') {

    const validationErrors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      type: error.type
    }))

    return res.status(400).json({
      error: 'Validation error',
      details: validationErrors
    })
  }

  // Handle Database Errors
  if (err.name === 'SequelizeDatabaseError') {
    if (err.message.includes('invalid input syntax for type uuid')) {
      return res.status(400).json({
        error: 'Invalid ID format',
        type: 'INVALID_ID'
      })
    }
    return res.status(500).json({
      error: 'Database error occurred',
      type: 'DATABASE_ERROR'
    })
  }



  // Handle Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      type: 'AUTH_ERROR'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      type: 'AUTH_ERROR'
    })
  }
}


const invalidIdHandler = (req, res, next) => {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (req.params.id && !uuidV4Regex.test(req.params.id)) {
    return res.status(400).json({
      error: 'Invalid ID format',
      details: 'ID must be a valid UUID v4'
    })
  }
  next()
}


const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  requestLogger,
  invalidIdHandler
}