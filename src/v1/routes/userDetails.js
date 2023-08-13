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
router.get("/:userId", verifyToken, UserController.getOneUserDetail);
router.patch("/:userId", verifyToken, UserController.updateOneUserDetail);
router.delete("/:userId", verifyToken, UserController.deleteOneUserDetail);

module.exports = router;
