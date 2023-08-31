require("dotenv").config();

module.exports = {
  mongodbUrl: process.env.DB_URI,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV,

  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
  CLOUD_NAME: process.env.CLOUD_NAME,

  API_BASEURL: process.env.API_BASEURL,
  UI_BASEURL: process.env.UI_BASEURL,
  API_BASENAME: process.env.API_BASENAME,
  API_BASEPATH: process.env.API_BASEPATH,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_SUB: process.env.EMAIL_SUB,
  EMAIL_RESET_SUB: process.env.EMAIL_RESET_SUB,
  EMAIL_VERIFY_SUB: process.env.EMAIL_VERIFY_SUB,
};
