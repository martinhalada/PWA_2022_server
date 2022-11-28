const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const xss = require("xss");
const passport = require("passport")
const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../authenticate")
const User = require("../models/user");

function checkAuthentication(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};

function validateLengthOfPassword(req, res, next) {
  if (xss(req.body.password).length < 12) {
    return res.send({ message: "Heslo musí mít alespoň 12 znaků." });
  }
  next();
};

router.post("/register", validateLengthOfPassword, userController.postRegister);
router.post("/login", passport.authenticate("local"), (req, res, next) => {
  const token = getToken({ _id: req.user._id });
  const refreshToken = getRefreshToken({ _id: req.user._id });
  User.findById(req.user._id).then(
    (user) => {
      user.refreshToken.push({ refreshToken });
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.send(err);
        } else {
          res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
          res.send({ success: true, token });
        }
      });
    },
    (err) => next(err)
  );
});

router.post("/refreshToken", userController.refreshToken);
router.get("/me", verifyUser, userController.me);
router.get("/logout", verifyUser, userController.logout);

module.exports = router;