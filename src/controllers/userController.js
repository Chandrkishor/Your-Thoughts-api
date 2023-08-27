const User = require("../modals/userModal");

const getAllUserDetails = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (errors) {
    const error = new Error(errors?.message);
    error.status = 500;
    throw error;
  }
};

const getOneUserDetail = async (req, res) => {
  const id = req.user.id;
  try {
    const userDetails = await User.findById(id).select(
      " -isEmailVerifiedToken -createdAt",
    );
    return res.status(200).json({
      status: "success",
      data: userDetails,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const updateOneUserDetail = async (req, res) => {
  const { userId } = req.params;
  const { name, dob, gender } = req.body;
  if (!name && !dob && !gender) {
    return res.status(400).json({ message: "Required data missing" });
  }
  const userVal = { name, dob, gender };
  try {
    //? { new: true } option as the third parameter to findOneAndUpdate to ensure that the updated user details are returned.
    const userDetails = await User.findOneAndUpdate({ _id: id }, userVal, {
      new: true,
    }).select("-isEmailVerifiedToken -createdAt");
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: userDetails,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const deleteOneUserDetail = async (req, res) => {
  const { userId } = req.params;
  try {
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
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getAllUserDetails,
  getOneUserDetail,
  updateOneUserDetail,
  deleteOneUserDetail,
};
