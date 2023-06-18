const User = require("../modals/users/userModal");

const getAllUserDetails = async () => {
  try {
    const users = await User.find().select(
      "-password -isAdmin -createdAt -updatedAt",
    );
    return users;
  } catch (error) {
    console.log("getAllUserDetails ~ error: >>", error);
    throw new Error(error);
  }

  // return userDetails;
};

const getOneUserDetail = (id) => {
  try {
    const userDetails = User.findById(id).select(
      "-password -isAdmin -createdAt",
    );
    return userDetails;
  } catch (error) {
    console.log("get user ~ error: >>", error);
    throw new Error(error);
  }
};

const updateOneUserDetail = () => {
  return;
};

const deleteOneUserDetail = () => {
  return;
};

module.exports = {
  getAllUserDetails,
  getOneUserDetail,
  updateOneUserDetail,
  deleteOneUserDetail,
};
