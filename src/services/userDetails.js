const UserDet = require("../database/usersDetails");
const User = require("../modals/userModal");

const getAllUserDetails = () => {
  // for dummy data (JSON)
  // const userDetails = UserDet.getAllUsers();
  User.find()
    .then((users) => {
      console.log(".then ~ users: >>", users);
      return users;
    })
    .catch((error) => {
      console.log("getAllUserDetails ~ error: >>", error);
      return error;
    });
  // return userDetails;
};

const getOneUserDetail = (id) => {
  const userDetails = UserDet.getUsersById(id);

  return userDetails;
};

const createNewUserDetail = (body) => {
  User.create(body)
    .then((createdUser) => {
      console.log("User created:", createdUser);
      return createdUser;
    })
    .catch((error) => {
      console.error("Error creating user:", error);
      return;
    });
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
