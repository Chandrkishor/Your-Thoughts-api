const express = require("express");
const userRoute = require("./routes/userRouter");
const mongoose = require("mongoose");
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

// app.use((err, req, res, next) => {
//   console.log(`🔥🔥err🌵 >`, err);
//   // Send the error message as part of the response
//   res.status(err.status || 500).json({ error: err.message });
// });
// app.use((req, res, next) => {
//   console.log("req.headers", req.headers);
//   next();
// });
// Use the body-parser middleware
app.use(cookieParser());
app.use(bodyParser.json());
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
