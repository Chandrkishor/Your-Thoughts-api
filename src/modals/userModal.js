const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { jwtSecret, jwtExpire } = require("../constant");
const jwt = require("jsonwebtoken");

//** Define the user schema for sign up for login we don't need we just have to run some logic to verify and generate token
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, "Name must have grater or equal than 2 characters"],
    maxlength: [40, "Name must have less or equal than 40 characters"],
    validate: {
      validator: function (value) {
        return validator.isAlphanumeric(value.replace(/\s/g, "")); // Removes spaces and checks if it's alphanumeric
      },
      message: "Name must be alphanumeric",
    },
  },
  email: {
    type: String,
    required: [true, " Email is required"],
    unique: [true, "should be unique"],
    lowercase: true, // convert to lowercase
    trim: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // it will worn in create and save only for update and all have use save if want to validate
      validator: function (value) {
        // here this is pointing the current document on new document creation
        return value === this.password; // true, means no error
      },
      message: "Passwords are not same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ["user", "manager", "admin"],
    default: "user",
  },
  dob: {
    // type: Date, // Consider using the Date type for storing date of birth
    type: String, // Consider using the Date type for storing date of birth
  },
  bio: {
    type: String,
  },
  address: {
    type: String,
  },
  website: {
    type: String,
    validate: {
      validator: function (value) {
        // Website URL validation regex
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
      },
      message: "Invalid website URL.",
    },
  },
  linkedin: {
    type: String,
    validate: {
      validator: function (value) {
        // LinkedIn URL validation regex
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
      },
      message: "Invalid LinkedIn URL.",
    },
  },
  // gender: {
  //   type: String,
  //   enum: ["male", "female", "other"],
  // },
  gender: {
    type: Object,
  },
  contact: {
    type: String,
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
    select: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // this will run if password is modified or created
  this.password = await bcrypt.hash(this.password, 12); // hash the password cose of 12 so no need salting
  this.confirmPassword = undefined; // delete the confirmPassword field
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next(); // this will run if password is modified or created

  this.passwordChangedAt = Date.now() - 1000; // some time token generation faster so subtracting seconds
  next();
});

//making instance and can be used any where
userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Generate a JWT token for authentication
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, jwtSecret, { expiresIn: jwtExpire });
};
// After generating token if user changed password and someone try to login using same jwt token and to protect that.
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < passwordTimestamp;
  }
  return false; // false means no change
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); // this will give 32 characters long hex string
  // this will encrypt the string
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // adding 10 min timeout
  return resetToken; //returning encrypted token
};
//? Create the User model using the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
