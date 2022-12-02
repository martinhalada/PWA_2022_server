const mongoose = require("mongoose");

let SessionSchema = new mongoose.Schema({
    refreshToken: { 
        type: String, 
        default: "" 
    }
});

let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: [SessionSchema]
    }
});

let User = mongoose.model("User", UserSchema);
module.exports = User;