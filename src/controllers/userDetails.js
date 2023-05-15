const userDetailsService = require("../services/userDetails");

const getAllUserDetails = async (req, res) => {
  const allUsers = await userDetailsService.getAllUserDetails();
  res.status(200).json(allUsers);
};

const getOneUserDetail = (req, res) => {
  const userDetails = userDetailsService.getOneUserDetail(req.params.userId);
  res.send({ status: "OK", data: userDetails });
};

const createNewUserDetail = async (req, res) => {
  let body = req.body;
  const createUser = await userDetailsService.createNewUserDetail(body);
  res.status(200).json(createUser);
};

const updateOneUserDetail = (req, res) => {
  const updateUser = userDetailsService.updateOneUserDetail();
  res.send({ status: "OK", data: updateUser });
};

const deleteOneUserDetail = (req, res) => {
  const deleteUser = userDetailsService.deleteOneUserDetail();
  res.send({ status: "OK", data: deleteUser });
};

module.exports = {
  getAllUserDetails,
  getOneUserDetail,
  createNewUserDetail,
  updateOneUserDetail,
  deleteOneUserDetail,
};
