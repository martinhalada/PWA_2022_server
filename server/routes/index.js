const express = require('express');
const router = express.Router();
const chatController = require("../controllers/chatController"); 

router.get("/", function(req,res){
    res.redirect("/index");
});

router.get("/allUsers/:currentUser", chatController.getAllUsers);
router.post("/createChatRoom", chatController.createChat);
router.get("/allChats/:currentUser", chatController.getAllChats);
router.get("/chat/:id", chatController.getAllMessages);

router.get("/index", chatController.getMainPage);

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

module.exports = router;