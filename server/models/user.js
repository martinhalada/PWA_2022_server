const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let SessionSchema = new mongoose.Schema({
    refreshToken: { type: String, default: "" }
});

let UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: "",
    },
    lastName: {
        type: String,
        default: "",
    },
    refreshToken: {
        type: [SessionSchema],
    },
});

UserSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret.refreshToken;
        return ret;
    },
});

UserSchema.plugin(passportLocalMongoose);
let User = mongoose.model("User", UserSchema);
module.exports = User;