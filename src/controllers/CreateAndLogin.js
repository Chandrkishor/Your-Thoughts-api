const CreateUser = require("../services/createAndLogin");

const registerUser = async (req, res) => {
  let body = req.body;
  console.log("registerUser ~ body: >>", body);
  const createUser = await CreateUser.registerUser(body);
  res.status(200).json(createUser);
};
const userLogin = async (req, res) => {
  let body = req.body;
  console.log("login ~ body: >>", body);
  res.status(200).json({ data: "login hit" });
};

module.exports = { registerUser, userLogin };
