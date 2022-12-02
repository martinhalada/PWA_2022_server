const express = require('express');
const router = express.Router();
const chatController = require("../controllers/chatController"); 

router.post("/chat/createChatRoom", chatController.createChat);
router.get("/chat/allChats/:currentUser", chatController.getAllChats);
router.get("/chat/getChat/:id", chatController.getAllMessages);
router.post("/chat/groupChat", chatController.createGroupChat);

module.exports = router;