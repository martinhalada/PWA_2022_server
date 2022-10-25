const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const xss = require("xss");

exports.getRegister = function(req, res){
    res.render("register.html");
};

exports.postRegister = async function(req, res){
    User.findOne({ email: xss(req.body.email) }, async function(err, data) {
        if(data){
            return res.render("register.html", {message: "This user already exists."});
        }
        try{
            const hashedPassword = await bcrypt.hash(xss(req.body.password), 10);
            let newUser = {
                username: xss(req.body.name),
                id: Date.now().toString(),
                email: xss(req.body.email),
                password: hashedPassword
            }
            User(newUser).save(function(err, data){
                if(err){
                    return res.render("register.html", {message: "Database error."});
                }
                res.redirect("/login");
            });
        }catch{
            res.redirect("/register");
        }
    });
};

exports.getLogin = function(req, res){
    res.render("login.html");
};

exports.postLogin = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
});

exports.logout = function(req, res){
    req.logout(function(err) {
        if (err){
            return next(err);
        }
        res.redirect("/login");
    });    
};