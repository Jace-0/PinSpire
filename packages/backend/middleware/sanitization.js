const sanitizeInput = (req, res, next) => {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          // Remove HTML tags and special characters
          req.body[key] = req.body[key]
            .replace(/<[^>]*>/g, '')  // Remove HTML tags
            .trim()                    // Remove whitespace
            .replace(/[<>]/g, '')     // Remove < and >
      }
    })
    }
  
    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = req.params[key]
            .replace(/[<>]/g, '')
            .trim()
        }
      })
    }
  
    next()
  }
  
  module.exports = sanitizeInput