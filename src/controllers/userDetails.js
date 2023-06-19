const userDetailsService = require("../services/userDetails");

const getAllUserDetails = async (req, res) => {
  const allUsers = await userDetailsService.getAllUserDetails();
  res.status(allUsers.status).json({ data: allUsers.data });
};

const getOneUserDetail = async (req, res) => {
  const id = req.params?.userId;
  const user = await userDetailsService.getOneUserDetail(id);
  res.status(user.status).json({ data: user.data });
};

const updateOneUserDetail = async (req, res) => {
  const { userId } = req.params;
  const { name, email, age, gender } = req.body;
  const newBody = { name, email, age, gender };
  const updateUser = await userDetailsService.updateOneUserDetail(
    userId,
    newBody,
  );
  res.status(updateUser.status).json({ data: updateUser.data });
};

const deleteOneUserDetail = async (req, res) => {
  const { userId } = req.params;
  const deleteUser = await userDetailsService.deleteOneUser(userId);
  res.status(deleteUser.status).json({ data: deleteUser.data });
};

module.exports = {
  getAllUserDetails,
  getOneUserDetail,
  updateOneUserDetail,
  deleteOneUserDetail,
};
