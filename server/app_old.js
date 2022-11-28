if (process.env.MODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const logger = require('morgan');
const passport = require("passport");
const User = require("./models/user");
const methodOverride = require("method-override");
const createError = require("http-errors");

const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
require("./authenticate");

var app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
let io = new Server(server);

const chatController = require("./controllers/chatController"); 

const users = {};
io.on("connection", (socket) => {
    socket.on("isOnline", function(data) {
        console.log('user connected: ' + data.currentUser);
        users[socket.id] = data.currentUser;
        socket.join(data.chatRoom);
        io.sockets.emit("isOnline", users);
    });   

    socket.on("chat", function(data){
        console.log("message is: " + data.message);
        chatController.saveNewMessage(data.message, data.send_user);
        console.log(data.chatRoom);
        io.sockets.to(data.chatRoom).emit("chat", data);
    });

    socket.on("typing", function(data){
        socket.broadcast.to(data.chatRoom).emit("typing", data);
    });

    socket.on('disconnect', function(data){
        console.log('user disconnected: ' + users[socket.id]);
        delete users[socket.id];
        io.sockets.emit("isOnline", users);
    });
});

var usersRouter = require('./routes/users');
var indexRouter = require('./routes/index');


let mongoDBUrl = process.env.DB_URL;
const connect = mongoose.connect(mongoDBUrl,{useNewUrlParser: true });
connect.then(db => {
    console.log("Connected to db.");
}).catch(err => {
    console.log(err);
});

passport.use(new LocalStrategy(User.authenticate()));

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET
passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ _id: jwt_payload._id }, function (err, user) {
        if (err) {
            return done(err, false)
        }
        if (user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    });
}));

// https://stackoverflow.com/questions/40324121/express-session-secure-true
app.use(bodyParser.json())
app.use(cookieParser(process.env.SESSION_SECRET))

app.use(passport.initialize());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use(methodOverride("_method"));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", usersRouter);
app.use("/", indexRouter);

app.use((req,res,next)=>{
    next(createError(404));
});
  
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.locals.message=err.message;
    res.send(err)
});

server.listen(3001, () => {
    console.log('listening on *:3001');
});
  
module.exports = app;