const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers in dev mode
  if (process.env.NODE_ENV !== 'production') {
    console.error('⚠️ [Error Handler Caught]:', err);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({
      success: false,
      message,
      error: 'CastError',
    });
  }

  // Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for '${field}'. Please use another value.`;
    return res.status(400).json({
      success: false,
      message,
      error: 'DuplicateKeyError',
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({
      success: false,
      message,
      error: 'ValidationError',
    });
  }

  // JsonWebTokenError
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token. Please log in again.',
      error: 'JsonWebTokenError',
    });
  }

  // TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired. Please log in again.',
      error: 'TokenExpiredError',
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error. Please try again later.',
    error: process.env.NODE_ENV === 'production' ? 'InternalServerError' : err.stack,
  });
};

module.exports = errorHandler;
