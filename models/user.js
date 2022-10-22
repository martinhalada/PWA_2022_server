const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    username: {type: String, required:true, lowercase:true, unique:true},
    id: {type: String, required:true},
    email: {type: String, required:true},
    password: {type: String, required:true, minlength: 12}
});

let User = mongoose.model("User", UserSchema);
module.exports = User;