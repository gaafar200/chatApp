const express = require("express");
const userController = require("../controllers/User");
const router = express.Router();

router.post("/register",userController.register);
router.get("/profile",userController.profile);
router.post("/login",userController.login);
router.get("/users",userController.getAllUsers);
router.get("/logout",userController.logout)

module.exports = router;