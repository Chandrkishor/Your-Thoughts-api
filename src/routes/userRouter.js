const express = require("express");
const UserController = require("../controllers/userController");
const UserCreateAndLogin = require("../controllers/Sign_In_UpController");
const { restrictTo, protect } = require("../controllers/authController");

const router = express.Router();

router
  .get("/verify/:link", UserCreateAndLogin.verifyEmail)
  .post("/sign_up", UserCreateAndLogin.singUp)
  .post("/login", UserCreateAndLogin.userLogin)
  .post("/forgot_password", UserCreateAndLogin.forgot)
  .patch("/reset_password/:token", UserCreateAndLogin.reset)
  .patch("/update_my_password", protect, UserCreateAndLogin.updatePassword);

router
  .get(
    "/users",
    protect,
    restrictTo("admin", "manager"),
    UserController.getAllUserDetails,
  )
  .get("/user", protect, UserController.getMyDetail)
  .get(
    "/user/:id",
    protect,
    restrictTo("admin", "manager"),
    UserController.getUserDetail,
  )
  .patch("/user", protect, UserController.updateOneUserDetail)
  .delete("/user", protect, UserController.deleteOneUserDetail);

module.exports = router;
