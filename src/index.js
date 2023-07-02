const express = require("express");
const v1UserRoute = require("./v1/routes/userDetails");
const crateAndLogin = require("./v1/routes/userCreateLogin");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const { verifyToken } = require("./utils");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;
// MongoDB Cloud connection URL
const mongodbUrl = process.env.DB_URI;

// Connect to MongoDB
mongoose
  .connect(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Use the body-parser middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use("/api/v1", crateAndLogin);
app.use("/api/v1/userDetails", verifyToken, v1UserRoute);

app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
});
