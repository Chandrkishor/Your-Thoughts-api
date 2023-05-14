const userDetailsService = require("../services/userDetails");

const getAllUserDetails = (req, res) => {
  const allUsers = userDetailsService.getAllUserDetails();
  res.send({ status: "OK", data: allUsers });
};

const getOneUserDetail = (req, res) => {
  const userDetails = userDetailsService.getOneUserDetail();
  res.send("Get an existing UserDetail");
};

const createNewUserDetail = (req, res) => {
  const createUser = userDetailsService.createNewUserDetail();
  res.send("Create a new UserDetail");
};

const updateOneUserDetail = (req, res) => {
  const updateUser = userDetailsService.updateOneUserDetail();
  res.send("Update an existing UserDetail");
};

const deleteOneUserDetail = (req, res) => {
  const deleteUser = userDetailsService.deleteOneUserDetail();
  res.send("Delete an existing UserDetail");
};

module.exports = {
  getAllUserDetails,
  getOneUserDetail,
  createNewUserDetail,
  updateOneUserDetail,
  deleteOneUserDetail,
};
