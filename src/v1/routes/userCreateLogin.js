const express = require("express");
const UserCreateAndLogin = require("../../controllers/LoginController");
const { verifyToken } = require("../../controllers/authController");

const router = express.Router();

// router.get("/:userId", UserCreateAndLogin.getOneUser);
router.get("/verify/:link", UserCreateAndLogin.verifyEmail);
router.post("/register", UserCreateAndLogin.registerUser);
router.post("/login", UserCreateAndLogin.userLogin);
router.post("/forgot_password", UserCreateAndLogin.forgot);
router.patch("/reset_password/:token", UserCreateAndLogin.reset);
router.patch(
  "/update_my_password",
  verifyToken,
  UserCreateAndLogin.updatePassword,
);

module.exports = router;
