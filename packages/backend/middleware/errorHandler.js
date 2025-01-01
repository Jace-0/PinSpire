const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.message });
    }

    if (err.message === 'Blog not found') {
        return res.status(404).json({ error: err.message });
      }
    res.status(500).json({ error: 'Internal server error' });
  }
  
module.exports = {
    errorHandler
}