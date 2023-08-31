const User = require("../modals/userModal");
const catchAsync = require("../utils/catchAsync");

const getAllUserDetails = catchAsync(async (req, res, next) => {
  const users = await User.find();
  return res.status(200).json({
    status: "success",
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
  console.log(`<< :--  id--: >>`, id);
  const userDetails = await User.findById(id).select(
    " -isEmailVerifiedToken -createdAt",
  );
  return res.status(200).json({
    status: "success",
    data: userDetails,
  });
});

// user can update their own data
const updateMe = catchAsync(async (req, res, next) => {
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

const deleteOneUserDetail = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const deletedUser = await User.findOneAndDelete({ _id: userId }).select(
    "-isEmailVerifiedToken -updatedAt",
  );
  if (!deletedUser) {
    return res.status(404).json({
      status: "failed",
      message: "User not found",
    });
  }
  return res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: deletedUser,
  });
});

module.exports = {
  getAllUserDetails,
  getMyDetail,
  getUserDetail,
  updateOneUserDetail,
  deleteOneUserDetail,
};
