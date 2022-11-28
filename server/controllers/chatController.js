const User = require("../models/user");
const ChatRoom = require("../models/chat")
const xss = require("xss");
var shortid = require('shortid');
const Message = require("../models/message");

exports.getAllUsers = async function(req, res, next){
    const allUsers = await User.find({ username: { $ne: xss(req.params.currentUser) } });
    return res.send({allUsers: allUsers});
};

exports.getMainPage = async function(req, res, next){
    const allUsers = await User.find({ username: { $ne: xss(req.user.username) } });
    const allChats = await ChatRoom.find({ users: {$all: [req.user.username]}});
    return res.send({ allUsers: allUsers, 
                                    allChats: allChats,
                                    currentUser: req.user.username, 
                                    currentUserId: req.user.id,
                                    messagesDivAttr: false });

};

let currentChatRoomId;
exports.createChat = async function(req, res, next){
    let currentUser = xss(req.body.currentUser);
    let secondUser = xss(req.body.secondUser);
    const chatRoomId = await ChatRoom.find({ users : {$all: [currentUser, secondUser], $size: 2}});
    if (chatRoomId.length === 0){
        currentChatRoomId = shortid.generate()
        let newChatRoomItem = {
            id: currentChatRoomId,
            users: [currentUser, secondUser]
        };
        let newChatRoom = ChatRoom(newChatRoomItem).save(function(err,data){
            if(err) return res.send({message: "Chyba databáze"});
        });
    } else {
        currentChatRoomId = chatRoomId[0].id;
    }
};

exports.getAllChats = async function(req, res, next){
    let currentUser = xss(req.params.currentUser);
    const allChats = await ChatRoom.find({ users: {$all: [currentUser]}});
    return res.send({allChats: allChats});
};

exports.getAllMessages = async function(req, res, next){
    let chat = xss(req.params.id);
    const messagesFromChatRoom = await Message.find({ chat: chat});
    return res.send({messages: messagesFromChatRoom});
};

exports.saveNewMessage = function(message, user, chatRoom){
    console.log(chatRoom, message, user);
    let newItem = {
        sender: user,
        chat: chatRoom,
        message:  message,
        time: Date.now()
    };
    let newMessage = Message(newItem).save(function(err,data){
        if(err) console.log("Chyba databáze");
    });
};
