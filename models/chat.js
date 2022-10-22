const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const Message = require("./message");

let ChatRoomSchema = new mongoose.Schema({
    users: [{
        type: ObjectId,
        ref: "User"
    }],
    messages: [Message]
});

let ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
module.exports = ChatRoom;