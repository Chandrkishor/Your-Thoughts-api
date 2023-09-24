const express = require("express");
const userRoute = require("./routes/userRouter");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {
  mongodbUrl,
  PORT,
  API_KEY,
  API_SECRET,
  CLOUD_NAME,
} = require("./constant");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const cloudinary = require("cloudinary").v2;

const app = express();

//* global middleware
// set security HTTP headers
app.use(helmet()); // at the beginning

//Limit rate request per IP
const limiter = rateLimit({
  max: 100, // maximum rate limit
  windowMs: 60 * 60 * 1000, //1hr
  message: "To many requests form this IP address, Please try again in an hour",
});
app.use("/api/v1", limiter);

//An uncaught exception occurs when an error is thrown but not caught by any surrounding try-catch block or error handling mechanism,allows you to define custom behavior for handling such exceptions.
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  console.log("Uncaught Exception!!! 🧨 Shutting down...");
  process.exit(1); // to shut down
});

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

// Connect to MongoDB
mongoose
  .connect(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  });

const UploadImg = async (req, res) => {
  const imageFile = req?.body;
  res.send(200);
  // const uploadResult = await cloudinary.uploader.upload(imageFile);
  // const imageURL = uploadResult.secure_url;
};

// Use the body-parser middleware

app.use(cookieParser()); // cookie parser
// app.use(bodyParser.json()); // body parser
app.use(bodyParser.json({ limit: "10kb" })); // if body parser data is more than 10 kb then it will not accept

// Data sanitization against NoSQL query injection like- { "email": {"$gt":""}, "password": "12345678" }
app.use(mongoSanitize()); // mongoSanitize filter $ sign and other queries

// Data sanitization against XSS
app.use(xss()); // it will protect like  "name": "<div id='bad-code'> hello ck</div>",

//* here we have to pass parameters(query) which is only allowed
app.use(
  hpp({
    whitelist: ["duration", "name"], // this is query which we will passing change it according to use
  }),
); // Prevent parameter pollution ( Parameter pollution occurs when an attacker manipulates HTTP request parameters to inject malicious data or tamper with the application's behavior.)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use("/api/v1", userRoute);
app.use("/api/v1/img", UploadImg);

//* routes error handling with custom error handlers
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

// storing server in a variable to shutdown on unexpected error
const server = app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  console.log("Unhandled rejection! 🧨 Shutting down...");
  server.close(() => {
    // saving server in a variable and then closing it and then shuting it down
    process.exit(1); // to shut down
  });
});
