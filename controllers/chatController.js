const User = require("../models/user");
const ChatRoom = require("../models/chat")
const xss = require("xss");
var shortid = require('shortid');
const Message = require("../models/message");

exports.getMainPage = async function(req, res, next){
    const allUsers = await User.find({ username: { $ne: xss(req.user.username) } });
    const allChats = await ChatRoom.find({ users: {$all: [req.user.username]}});
    return res.render("index.html", { allUsers: allUsers, 
                                    allChats: allChats,
                                    currentUser: req.user.username, 
                                    currentUserId: req.user.id,
                                    messagesDivAttr: false });

};

let currentChatRoomId;
exports.createChat = async function(req, res, next){
    let currentUser = xss(req.user.username);
    let secondUser = xss(req.params.id);
    const chatRoomId = await ChatRoom.find({ users : {$all: [currentUser, secondUser], $size: 2}});
    if (chatRoomId.length === 0){
        currentChatRoomId = shortid.generate()
        let newChatRoomItem = {
            id: currentChatRoomId,
            users: [currentUser, secondUser]
        };
        let newChatRoom = ChatRoom(newChatRoomItem).save(function(err,data){
            if(err) return res.render("error.html", {message: "Chyba databáze"});
        });
    } else {
        currentChatRoomId = chatRoomId[0].id;
    }
    res.redirect("/index/chat/"+currentChatRoomId);
};

exports.getChat = async function(req, res, next){
    let chatId = xss(req.params.id);
    let currentUser = xss(req.user.username);
    const allUsers = await User.find({ username: { $ne: currentUser } });
    
    const messagesFromChatRoom = await Message.find({ chat: chatId});
    const allChats = await ChatRoom.find({ users: {$all: [currentUser]}});
    
    return res.render("index.html", { allUsers: allUsers, 
        allChats: allChats,
        currentUser: req.user.username, 
        currentUserId: req.user.id,
        messagesDivAttr: true,
        messages: messagesFromChatRoom });
};

exports.saveNewMessage = function(message, user){
    console.log(currentChatRoomId, message, user);
    let newItem = {
        sender: user,
        chat: currentChatRoomId,
        message:  message,
        time: Date.now()
    };
    let newMessage = Message(newItem).save(function(err,data){
        if(err) return res.render("error.html", {message: "Chyba databáze"});
    });
};
