const User = require("../modals/users/userModal");

const getAllUserDetails = async () => {
  try {
    const users = await User.find().select(
      "-password -isAdmin -createdAt -updatedAt",
    );
    return {
      status: 200,
      data: users,
    };
  } catch (error) {
    throw new Error(error);
  }

  // return userDetails;
};

const getOneUserDetail = async (id) => {
  try {
    const userDetails = await User.findById(id).select(
      "-password -isAdmin -createdAt",
    );
    return {
      status: 200,
      data: userDetails,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const updateOneUserDetail = async (id, body) => {
  try {
    //? { new: true } option as the third parameter to findOneAndUpdate to ensure that the updated user details are returned.
    const userDetails = await User.findOneAndUpdate({ _id: id }, body, {
      new: true,
    }).select("-password -isAdmin -createdAt");
    return {
      status: 200,
      message: "User updated successfully",
      data: userDetails,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const deleteOneUser = async (id) => {
  try {
    const deletedUser = await User.findOneAndDelete({ _id: id }).select(
      "-password -isAdmin -updatedAt",
    );
    if (!deletedUser) {
      return {
        status: 404,
        message: "User not found",
        data: null,
      };
    }
    return {
      status: 200,
      message: "User deleted successfully",
      data: deletedUser,
    };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getAllUserDetails,
  getOneUserDetail,
  updateOneUserDetail,
  deleteOneUser,
};
