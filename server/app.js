const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const mongoose = require("mongoose");
const cors = require("cors");
const xss = require("xss");

if (process.env.NODE_ENV !== "production") {
    // Load environment variables from .env file in non prod environments
    require("dotenv").config();
}

let mongoDBUrl = process.env.DB_URL;
const connect = mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
connect.then(db => {
    console.log("Connected to db.");
}).catch(err => {
    console.log(err);
});

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ _id: jwt_payload._id }, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

passport.use(new LocalStrategy({ username: "email" },
    function (email, password, done) {
        User.findOne({ email: xss(email) }, async function (err, user) {
            if (user == null) {
                return done(null, false, { message: "Chybně zadaný email nebo heslo" }) //chybný email
            }
            try {
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: "Chybně zadaný email nebo heslo" }) //chybné heslo
                }
            } catch (e) {
                return done(e)
            }
        });
    }
));

passport.serializeUser((user, done) => done(null, user.id)); //set user details in req.user
passport.deserializeUser((id, done) => {
    User.findOne({ id: xss(id) }).then((user) => {
        done(null, user);
    });
});

require("./authenticate");

const app = express();
const http = require('http').Server(app);
let io = require("socket.io")(http, {
    cors: {
        origin: process.env.WHITELISTED_DOMAINS
    }
});

//Add the client URL to the CORS policy
const whitelist = process.env.WHITELISTED_DOMAINS
    ? process.env.WHITELISTED_DOMAINS.split(",")
    : []

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },

    credentials: true,
}
app.use(cors(corsOptions))

const chatController = require("./controllers/chatController");

const users = {};
io.on("connection", (socket) => {
    console.log("socket id: " + socket.id)
    socket.on("isOnline", function (data) {
        console.log('user connected: ' + data.currentUser);
        users[socket.id] = data.currentUser;
        io.sockets.emit("isOnline", users);
    });

    socket.on("joinRoom", function (data) {
        socket.join(data.chatRoom);
    });

    socket.on("chat", function (data) {
        chatController.saveNewMessage(data.message, data.send_user, data.chatRoom);
        //io.sockets.to(data.chatRoom).emit("chat", data);
        socket.broadcast.to(data.chatRoom).emit("chat", data);
    });

    socket.on("typing", function (data) {
        socket.broadcast.to(data.chatRoom).emit("typing", data);
    });

    socket.on('logout', function (data) {
        console.log('user disconnected: ' + data.currentUser);
        delete users[socket.id];
        io.sockets.emit("isOnline", users);
    });

    socket.on('disconnect', function (data) {
        console.log('user disconnected: ' + users[socket.id]);
        delete users[socket.id];
        io.sockets.emit("isOnline", users);
    });
});

const userRouter = require("./routes/users");
const indexRouter = require("./routes/index");

app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET));


app.use(passport.initialize());

app.use("/", userRouter);
app.use("/", indexRouter);

const server = http.listen(process.env.PORT || 3001, function () {
    const port = server.address().port;

    console.log("App started at port:", port);
});
