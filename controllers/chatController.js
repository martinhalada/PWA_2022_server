const User = require("../models/user");
const ChatRoom = require("../models/chat")
const xss = require("xss");
var shortid = require('shortid');
const Message = require("../models/message");

exports.getMainPage = function(req, res, next){
    console.log(req.session.passport);
    console.log(req.user);
    const data = User.find({ id: { $ne: xss(req.user.id) } }, function(err, data){
        if (err) {
            return res.render("error.html", { message: "Chyba databáze."});
        }
        return res.render("index.html", { allUsers: data, 
                                        currentUser: req.user.username, 
                                        currentUserId: req.user.id,
                                        messagesDivAttr: false });
    });
};

let currentChatRoomId;
exports.getChat = async function(req, res, next){
    let currentUser = xss(req.user.id);
    let secondUser = xss(req.params.id);
    console.log(currentUser, secondUser);
    const allUsers = await User.find({ id: { $ne: xss(req.user.id) } });
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
    const messagesFromChatRoom = await Message.find({ chat: currentChatRoomId});

    return res.render("index.html", { allUsers: allUsers, 
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
