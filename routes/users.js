const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const xss = require("xss");

function checkAuthentication(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect("/");
    }
    next();
};

function validateLengthOfPassword(req, res, next){
    if (xss(req.body.password).length < 12){
        return res.render("register.html", { message: "Password must be at least 12 character long."});
    }
    next();
};

router.get("/register", checkAuthentication, userController.getRegister);
router.post("/register", validateLengthOfPassword, checkAuthentication, userController.postRegister);
router.get("/login", checkAuthentication, userController.getLogin);
router.post("/login", checkAuthentication, userController.postLogin);
router.delete("/logout",userController.logout);

module.exports = router;