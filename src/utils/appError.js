class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // for operational error like required filed not send by user
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
