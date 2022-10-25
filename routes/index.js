const express = require('express');
const router = express.Router();
const chatController = require("../controllers/chatController"); 

router.get("/", function(req,res){
    res.redirect("/index");
});

router.get("/index", checkAuthenticated, chatController.getMainPage);

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

module.exports = router;