const express = require("express");
const UserController = require("../../controllers/userController");

const router = express.Router();

router.get("/", UserController.getAllUserDetails);
router.get("/:userId", UserController.getOneUserDetail);
router.patch("/:userId", UserController.updateOneUserDetail);
router.delete("/:userId", UserController.deleteOneUserDetail);

module.exports = router;
