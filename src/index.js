const express = require("express");
const v1UserRoute = require("./v1/routes/userDetails");
const crateAndLogin = require("./v1/routes/userCreateLogin");
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
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
const UploadImg = async (req, res) => {
  const imageFile = req?.body;
  console.log("UploadImg ~-------- imageFile: >>", imageFile);
  console.log("UploadImg ~-------- imageFile: >>", req);
  res.send(200);
  // const uploadResult = await cloudinary.uploader.upload(imageFile);
  // const imageURL = uploadResult.secure_url;
};

app.use((err, req, res, next) => {
  console.error(err); //for debugging purposes
  // Send the error message as part of the response
  res.status(err.status || 500).json({ error: err.message });
});
// app.use((req, res, next) => {
//   console.log("req.headers", req.headers);
//   next();
// });
// Use the body-parser middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use("/api/v1", crateAndLogin);
app.use("/api/v1/img", UploadImg);
app.use("/api/v1/userDetails", v1UserRoute);

//* routes error handling with custom error handlers
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
});
