const express = require("express");
const UserController = require("../../controllers/userController");
const { restrictTo, verifyToken } = require("../../controllers/authController");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  restrictTo("admin", "manager"),
  UserController.getAllUserDetails,
);
router.get("/user", verifyToken, UserController.getOneUserDetail);
router.patch("/user", verifyToken, UserController.updateOneUserDetail);
router.delete("/user", verifyToken, UserController.deleteOneUserDetail);

module.exports = router;
