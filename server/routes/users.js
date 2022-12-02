const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const chatController = require("../controllers/chatController");
const xss = require("xss");
const passport = require("passport");
const { verifyUser } = require("../authenticate");

function validateLengthOfPassword(req, res, next) {
    if (xss(req.body.password).length < 12) {
        return res.send({ message: "Heslo musí mít alespoň 12 znaků." });
    }
    next();
};

router.post("/user/register", validateLengthOfPassword, userController.postRegister);
router.post("/user/login", validateLengthOfPassword, passport.authenticate("local"), userController.login);
router.get("/user/allUsers/:currentUser", chatController.getAllUsers);
router.post("/user/refreshToken", userController.refreshToken);
router.get("/user/me", verifyUser, userController.me);
router.get("/user/logout", verifyUser, userController.logout);

module.exports = router;