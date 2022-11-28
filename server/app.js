const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const cors = require("cors")

if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config();
}

let mongoDBUrl = process.env.DB_URL;
const connect = mongoose.connect(mongoDBUrl, { 
  useNewUrlParser: true,
  useUnifiedTopology: true });
connect.then(db => {
  console.log("Connected to db.");
}).catch(err => {
  console.log(err);
});

require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");
require("./authenticate");

const app = express();
const http = require('http').Server(app);
let io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000"
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
    socket.on("isOnline", function(data) {
        console.log('user connected: ' + data.currentUser);
        users[socket.id] = data.currentUser;
        //socket.join(data.chatRoom);
        io.sockets.emit("isOnline", users);
    });   

    socket.on("chat", function(data){
        chatController.saveNewMessage(data.message, data.send_user, data.chatRoom);
        socket.join(data.chatRoom);
        io.sockets.to(data.chatRoom).emit("chat", data);
    });

    socket.on("typing", function(data){
        socket.join(data.chatRoom);
        socket.broadcast.to(data.chatRoom).emit("typing", data);
    });

    socket.on('disconnect', function(data){
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
