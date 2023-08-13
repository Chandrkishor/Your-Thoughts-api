const express = require("express");
const UserCreateAndLogin = require("../../controllers/LoginCtrl");
const { forgotPassword } = require("../../controllers/authController");

const router = express.Router();

// router.get("/:userId", UserCreateAndLogin.getOneUser);
router.get("/verify/:link", UserCreateAndLogin.verifyEmail);
router.post("/register", UserCreateAndLogin.registerUser);
router.post("/login", UserCreateAndLogin.userLogin);
router.post("/forgot_password", UserCreateAndLogin.forgot);
router.patch("/reset_password/:token", UserCreateAndLogin.reset);

module.exports = router;
