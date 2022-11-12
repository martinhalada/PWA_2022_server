if (process.env.MODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const logger = require('morgan');
const nunjucks  = require('nunjucks');
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const User = require("./models/user");
const methodOverride = require("method-override");
const xss = require("xss");
const createError = require("http-errors");

const LocalStrategy = require("passport-local").Strategy;

var app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
let io = new Server(server);

const chatController = require("./controllers/chatController"); 

const users = {};
io.on("connection", (socket) => {
    socket.on("isOnline", function(data) {
        console.log('user connected: ' + data);
        users[socket.id] = data;
        io.sockets.emit("isOnline", users);
    });   

    socket.on("chat", function(data){
        console.log("message is: " + data.message);
        chatController.saveNewMessage(data.message, data.send_user);
        io.sockets.emit("chat", data);
    });

    socket.on("typing", function(data){
        socket.broadcast.emit("typing", data);
    });

    socket.on('disconnect', function(data){
        console.log('user disconnected: ' + users[socket.id]);
        delete users[socket.id];
        io.sockets.emit("isOnline", users);
    });
});

var usersRouter = require('./routes/users');
var indexRouter = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
nunjucks.configure('views', {
    autoescape: true,
    cache: false,
    express: app
});

let mongoDBUrl = process.env.DB_URL;
mongoose.connect(mongoDBUrl,{useNewUrlParser: true });

passport.use(new LocalStrategy({usernameField: "email"}, 
    function(email, password, done) {
        User.findOne({ email: xss(email) }, async function(err, user) {
            if(user==null){
                return done(null, false, {message: "Chybné jméno nebo heslo."}); //chybný email
            }
            try{
                if(await bcrypt.compare(password, user.password)){
                    return done(null,user);
                }else{
                    return done(null,false, {message: "Chybné jméno nebo heslo."}); //chybné heslo
                }
            }catch(e){
                return done(e);
            }
        });
    }
));

// https://stackoverflow.com/questions/40324121/express-session-secure-true
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:true,
    saveUninitialized:false,
    proxy: true,
    cookie:{
    //    secure:true,
        httpOnly:true, 
        sameSite:true
    },
    store: MongoStore.create({
        mongoUrl:process.env.DB_URL
    })
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done)=> done(null,user.id));
passport.deserializeUser((id, done)=> {  
    User.findOne({id: xss(id)}).then((user)=>{
        done(null,user);
    });
});

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use(methodOverride("_method"));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", usersRouter);
app.use("/", indexRouter);

app.use((req,res,next)=>{
    next(createError(404));
});
  
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.locals.message=err.message;
    res.render('error.html',{err});
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
  
module.exports = app;