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
    minlength: 8,
    validate: {
      validator: function (value) {
        // Password validation regex (at least one special character)
        return /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/.test(
          value,
        );
      },
      message:
        "Password should be at least 8 characters long and contain at least one special character.",
    },
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 5,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  contact: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    validate: {
      validator: function (value) {
        // Contact number validation regex (10 digits)
        return /^\d{10}$/.test(value);
      },
      message: "Contact number should be a 10-digit number.",
    },
  },
  image: {
    type: String,
    validate: {
      validator: function (value) {
        // Base64 image validation regex
        return /^data:image\/(png|jpeg|jpg);base64,/.test(value);
      },
      message: "Invalid image format. Only PNG and JPEG images are allowed.",
    },
  },
  imageType: {
    type: String,
  },
  imageSize: {
    type: Number,
    validate: {
      validator: function (value) {
        // Image size validation (maximum 5MB)
        return value <= 5 * 1024 * 1024;
      },
      message: "Image size should be less than or equal to 5MB.",
    },
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
