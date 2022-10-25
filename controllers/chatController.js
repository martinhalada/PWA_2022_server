const User = require("../models/user");
const xss = require("xss");

exports.getMainPage = function(req, res, next){
    console.log(req.session.passport);
    const data = User.find({ id: { $ne: xss(req.user.id) } }, function(err, data){
        if (err) {
            return res.render("error.html", { message: "Chyba databáze."});
        }
        return res.render("index.html", { allUsers: data});
    });
};
