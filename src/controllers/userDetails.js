const userDetailsService = require("../services/userDetails");

const getAllUserDetails = async (req, res) => {
  const allUsers = await userDetailsService.getAllUserDetails();
  res.status(200).json(allUsers);
};

const getOneUserDetail = async (req, res) => {
  const id = req.params?.userId;
  const user = await userDetailsService.getOneUserDetail(id);
  res.send({ status: "OK", data: user });
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
  updateOneUserDetail,
  deleteOneUserDetail,
};
