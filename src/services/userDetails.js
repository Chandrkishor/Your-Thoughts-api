const UserDet = require("../database/usersDetails");

const getAllUserDetails = () => {
  const userDetails = UserDet.getAllUsers;
  return userDetails;
};

const getOneUserDetail = () => {
  return;
};

const createNewUserDetail = () => {
  return;
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
  createNewUserDetail,
  updateOneUserDetail,
  deleteOneUserDetail,
};
