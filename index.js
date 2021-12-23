const express = require('express');
const expsession = require('express-session');
const InitiateMongoServer = require('./DB/database.js')
const User = require('./Model/userModel')
const Messages = require('./Model/chatSchema');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
require('dotenv').config();
const io = new Server(server);
const PORT = process.env.PORT;
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const { connect } = require('http2');
let wrong = false;

const MONGODB_USER = process.env.MONGO_USER;
const MONGODB_PWD = process.env.MONGO_PW;
const MONGODB_DB = process.env.MONGO_DB;

mongoose.connect(`mongodb+srv://${MONGODB_USER}:${MONGODB_PWD}@cluster0.ctith.mongodb.net/${MONGODB_DB}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const sessionMiddleware = expsession({
    secret: 'mangouste de merde', resave: true, saveUninitialized: true
})

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/Views'));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const wrap = middleware => (socket, next) => middleware (socket.request, {}, next);

io.use(wrap(sessionMiddleware));

io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    if (socket.request.user) next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Views/login.html');
});

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) res.redirect('chat');
    res.sendFile(__dirname + '/Views/login.html');
    // if (wrong) {
    //     res.render('<p class="error">Wrong username or password</p>');
    // }
})
app.post('/login', passport.authenticate('local', {
        successRedirect: "/chat",
        failureRedirect: "/login"
    }), (req, res) => {

});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/Views/register.html');
});
app.post('/register', (req, res) => {
    User.findOne({username: req.body.username}, (err, user) => {
        if (err) res.json({success: false, message: err});
        if (!user) {
            User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
                if (err) res.json({success: false, message: err});
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/login');
                });
            });
        }
    });
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/Views/chat.html');
    
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/");
});

io.on('connection', (socket) => {
    Messages.find({}).lean().exec((err, records) => {
        if (err) console.log("cheh!");
        records.forEach(element => {
            socket.emit("chat message", element.sender + " : " + element.message);
            console.log(element.sender + " : " + element.message);
        });
        console.log("messages loaded");
    })
    console.log('user ' + socket.request.user.username + ' connected');
    socket.on('disconnect', () => {
        console.log('user ' + socket.request.user.username + ' disconnected');
    });
    socket.on('chat message', (msg) => {
        console.log(socket.request.user.username + ' : ' + msg);
        io.emit('chat message', socket.request.user.username + ' : ' + msg);
        Messages.create({
            sender: socket.request.user.username,
            message: msg
        });
    });
});

server.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
});
