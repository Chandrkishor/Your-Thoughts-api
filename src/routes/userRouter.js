const express = require("express");
const UserController = require("../controllers/userController");
const UserCreateAndLogin = require("../controllers/Sign_In_UpController");
const { restrictTo, verifyToken } = require("../controllers/authController");

const router = express.Router();

router
  .get("/verify/:link", UserCreateAndLogin.verifyEmail)
  .post("/sign_up", UserCreateAndLogin.singUp)
  .post("/login", UserCreateAndLogin.userLogin)
  .post("/forgot_password", UserCreateAndLogin.forgot)
  .patch("/reset_password/:token", UserCreateAndLogin.reset)
  .patch("/update_my_password", verifyToken, UserCreateAndLogin.updatePassword);

router
  .get(
    "/users",
    verifyToken,
    restrictTo("admin", "manager"),
    UserController.getAllUserDetails,
  )
  .get("/user", verifyToken, UserController.getMyDetail)
  .get(
    "/user/:id",
    verifyToken,
    restrictTo("admin", "manager"),
    UserController.getUserDetail,
  )
  .patch("/user", verifyToken, UserController.updateOneUserDetail)
  .delete("/user", verifyToken, UserController.deleteOneUserDetail);

module.exports = router;
