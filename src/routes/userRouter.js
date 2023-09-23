const express = require("express");
const UserController = require("../controllers/userController");
const UserCreateAndLogin = require("../controllers/Sign_In_UpController");
const { restrictTo, protect } = require("../controllers/authController");

const router = express.Router();

router
  .get("/verify/:link", UserCreateAndLogin.verifyEmail)
  .post("/sign_up", UserCreateAndLogin.singUp)
  .post("/login", UserCreateAndLogin.userLogin)
  .post("/forgot_password", UserCreateAndLogin.forgot) // take there email and send a mail to registered email id
  .patch("/reset_password/:token", UserCreateAndLogin.reset) // take the reset password and secret from reset email, verify it and then update the password
  .patch("/update_my_password", protect, UserCreateAndLogin.updatePassword);

router

  .get("/user", protect, UserController.getMyDetail) //  for user  details
  .patch("/update_me", protect, UserController.updateMe) // for user update
  // both  management and user
  .delete(
    "/delete_me",
    protect,
    restrictTo("admin", "user"),
    UserController.deleteMe,
  )
  // for management
  .get(
    "/users",
    protect,
    restrictTo("admin", "manager"),
    UserController.getAllUserDetails,
  )
  // for management
  .get(
    "/user/:id",
    protect,
    restrictTo("admin", "manager"),
    UserController.getUserDetail,
  )
  // for management
  .patch(
    "/update_user",
    protect,
    restrictTo("admin", "manager"),
    UserController.updateOneUserDetail,
  );

module.exports = router;
