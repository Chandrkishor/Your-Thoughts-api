const User = require("../modals/userModal");
const { isValidObjKeyVal, filterObjKey } = require("../utils");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getAllUserDetails = catchAsync(async (req, res, next) => {
  const users = await User.find();
  return res.status(200).json({
    status: "success",
    results: users?.length ?? 0,
    data: users,
  });
});

const getMyDetail = catchAsync(async (req, res, next) => {
  const id = req.user.id;
  const userDetails = await User.findById(id).select(
    " -isEmailVerifiedToken -createdAt",
  );
  return res.status(200).json({
    status: "success",
    data: userDetails,
  });
});
const getUserDetail = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new AppError("Please provide correct userId", 404));
  }
  const userDetails = await User.findById(id).select(
    " -isEmailVerifiedToken -createdAt",
  );
  if (!userDetails) {
    return next(new AppError("User not found", 404));
  }
  return res.status(200).json({
    status: "success",
    data: userDetails,
  });
});

// user can update their own data
const updateMe = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  console.log(`🕷️  userId: >>`, userId);
  const { password = null, confirmPassword = null } = req.body;

  if (password || confirmPassword) {
    return next(
      new AppError(
        "This route is not for password update Please use 'update_my_password'",
        400,
      ),
    );
  }

  const filteredBody = filterObjKey(req.body, "name", "dob", "gender", "email");
  //? { new: true } option as the third parameter to findOneAndUpdate to ensure that the updated user details are returned.
  const userDetails = await User.findOneAndUpdate(
    { _id: userId },
    filteredBody,
    {
      new: true,
    },
  ).select("-isEmailVerifiedToken -createdAt");
  return res.status(200).json({
    status: "success",
    data: userDetails,
  });
});
// administrator will update the user data
const updateOneUserDetail = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { name, dob, gender } = req.body;
  if (!name && !dob && !gender) {
    return res.status(400).json({ message: "Required data missing" });
  }
  const userVal = { name, dob, gender };
  //? { new: true } option as the third parameter to findOneAndUpdate to ensure that the updated user details are returned.
  const userDetails = await User.findOneAndUpdate({ _id: id }, userVal, {
    new: true,
  }).select("-isEmailVerifiedToken -createdAt");
  return res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: userDetails,
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  if (!deletedUser) {
    next(new AppError("User not found", 404));
  }
  return res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  updateMe,
  getMyDetail,
  getUserDetail,
  getAllUserDetails,
  deleteMe,
  updateOneUserDetail,
};
