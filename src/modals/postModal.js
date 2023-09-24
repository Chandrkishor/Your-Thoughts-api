const mongoose = require("mongoose");
const validator = require("validator");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: [10, "minium 10 characters required"],
    maxlength: [120, "Max 120 characters"],
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  tags: [
    {
      type: String,
      required: true,
      validate: {
        validator: (value) => {
          // Custom validation using validator library
          return validator.isAlpha(value.replace(/ /g, ""), "en-US", {
            ignore: " ",
          });
        },
        message: "Tags must contain only letters and spaces",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
