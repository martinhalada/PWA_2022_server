const { ObjectId } = require("bson");
const mongoose = require("mongoose");

let MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        ref: "User",
        required: true
    },
    chat: {
        type: String,
        ref: "ChatRoom",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type: Date
    }
});

let Message = mongoose.model("Message", MessageSchema);
module.exports = Message;