const { NODE_ENV } = require("../constant");
const AppError = require("../utils/appError");

const handleCastError = (error) => {
  const message = `Invalid ${error.path}:${error.value}`;
  return AppError(message, 400);
};
const handleDuplicateFieldDB = (error, fieldName) => {
  const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  console.log(`<< :--  value--: >>`, value);
  const message = `Duplicate value for field '${fieldName}'. Please use another value.`;
  return new AppError(message, 400);
};

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

    sendErrorProd(error, res);
  }
};
