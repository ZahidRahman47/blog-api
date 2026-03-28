const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
  
    // Mongoose: bad ObjectId (e.g. /users/notanid)
    if (err.name === "CastError") {
      statusCode = 404;
      message = "Resource not found";
    }
  
    // Mongoose: duplicate key (e.g. email already exists)
    if (err.code === 11000) {
      statusCode = 400;
      const field = Object.keys(err.keyValue)[0];
      message = `${field} already exists`;
    }
  
    // Mongoose: validation failed
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
    }
  
    // JWT: token invalid
    if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token";
    }
  
    // JWT: token expired
    if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token expired, please login again";
    }
  
    res.status(statusCode).json({
      success: false,
      message,
      // only show stack trace in development
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  };
  
  module.exports = errorHandler;