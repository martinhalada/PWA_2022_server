const { ObjectId } = require("bson");
const mongoose = require("mongoose");

let MessageSchema = new mongoose.Schema({
    send: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    message: {
        required: true
    },
    time: {
        type: Date
    }
});

let Message = mongoose.model("Message", MessageSchema);
module.exports = Message;