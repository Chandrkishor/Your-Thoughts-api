const userDetailsService = require("../services/userDetails");

const getAllUserDetails = async (req, res) => {
  const allUsers = await userDetailsService.getAllUserDetails();
  res.status(allUsers.status).json(allUsers.data);
};

const getOneUserDetail = async (req, res) => {
  const id = req.params?.userId;
  const Requester = req?.user ?? null;
  const user = await userDetailsService.getOneUserDetail(id, Requester?.userId);
  res.status(user.status).json(user.data);
};

const updateOneUserDetail = async (req, res) => {
  const { userId } = req.params;
  const { name, dob, gender } = req.body;
  if (!name && !dob && !gender) {
    return res.status(400).json({ message: "Required data missing" });
  }
  const updateUser = await userDetailsService.updateOneUserDetail(
    userId,
    req.body,
  );
  res.status(updateUser.status).json(updateUser.data);
};

const deleteOneUserDetail = async (req, res) => {
  const { userId } = req.params;
  const deleteUser = await userDetailsService.deleteOneUser(userId);
  res.status(deleteUser.status).json(deleteUser.data);
};

module.exports = {
  getAllUserDetails,
  getOneUserDetail,
  updateOneUserDetail,
  deleteOneUserDetail,
};
