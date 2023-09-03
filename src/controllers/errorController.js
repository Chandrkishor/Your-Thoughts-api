const { NODE_ENV } = require("../constant");
const AppError = require("../utils/appError");

const handleCastError = (error) => {
  const message = `Invalid ${error.path}:${error.value}`;
  return AppError(message, 400);
};
const handleDuplicateFieldDB = (error) => {
  const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const message = `Duplicate value for field '${value}'. Please use another value.`;
  return new AppError(message, 400);
};
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((value) => value.message);
  const message = `Invalid input data. ${errors.join(", ")}`;
  return new AppError(message, 400);
};
const handleJsonWebTokenError = () =>
  new AppError("Invalid token. Please login again", 401);
const handleTokenExpiredError = () =>
  new AppError("Your token has expired! Please login again", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  // operational, trusted error: send msg to client
  if (err.isOperational) {
    console.log(`err--isOperational: 🔥🕷️🕷️ >>`, err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming to other unknown error :don't leak error details to client
    console.log(`err--: 🔥 >>`, err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(`err.stack--: >>`, err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (NODE_ENV === "production") {
    let error = { ...err };
    if (error.name === "CastError") error = handleCastError(error);
    if (error.code === "11000") error = handleDuplicateFieldDB(error);
    if (error.name === "ValidationError") error = handleValidationError(error);
    if (error.name === "JsonWebTokenError") error = handleJsonWebTokenError();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};
