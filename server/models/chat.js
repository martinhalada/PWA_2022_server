const { ObjectId } = require("bson");
const mongoose = require("mongoose");

let ChatRoomSchema = new mongoose.Schema({
    id: {type: String, required:true},
    users: [{
        type: String,
        ref: "User"
    }]
});

let ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
module.exports = ChatRoom;