const Post = require("../modals/postModal");
const { filterObjKey, isValidObjKeyVal } = require("../utils");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// sending responses
const sendResponse = (res, statusCode, data) => {
  const response = {
    status: "success",
    data,
  };
  return res.status(statusCode).json(response);
};

const createPost = catchAsync(async (req, res, next) => {
  //   Validation
  const isObjValid = isValidObjKeyVal(req.body, "content", "title", "tags");
  if (!isObjValid?.valid) {
    return next(new AppError(`${isObjValid.message}`, 400));
  }

  const existingTitle = await Post.findOne({ title: req.body.title });
  if (existingTitle) {
    return next(new AppError(`This title already exists`, 409));
  }

  // creating new post
  const filteredBody = filterObjKey(req.body, "content", "title", "tags");
  const post = await Post.create({ ...filteredBody, user: req.user._id });

  // Return success response
  sendResponse(res, 200, post);
});

const updatePost = catchAsync(async (req, res, next) => {
  const isObjValid = isValidObjKeyVal(req.body, "content", "title", "tags");
  if (!isObjValid?.valid) {
    return next(new AppError(`${isObjValid.message}`, 400));
  }

  const postId = req.params.id;
  // Find the post to update
  const postToUpdate = await Post.findById(postId);
  if (!postToUpdate) {
    return next(new AppError("Post not found", 404));
  }

  const { title, content, tags } = req.body;
  if (title !== postToUpdate.title) {
    const existingTitle = await Post.findOne({ title });
    if (existingTitle) {
      return next(new AppError("This title already exists", 409));
    }
  }

  // Update the post fields
  postToUpdate.content = content;
  postToUpdate.title = title;
  postToUpdate.tags = tags;

  // Save the updated post
  const updatedPost = await postToUpdate.save();

  // Return success response
  sendResponse(res, 200, updatedPost);
});

module.exports = {
  createPost,
  updatePost,
};
