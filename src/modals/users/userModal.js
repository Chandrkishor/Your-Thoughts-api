const mongoose = require("mongoose");

//** Define the user schema for sign up for login we don't need we just have to run some logic to verify and generate token
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  contact: {
    type: Number,
  },
  image: {
    type: String,
  },
  imageType: {
    type: String,
  },
  imageSize: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

//? Create the User model using the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
