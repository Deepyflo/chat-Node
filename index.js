const express = require('express');
const InitiateMongoServer = require('./DB/database.js')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;
const bodyParser = require('body-parser');
let wrong = false;

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(__dirname + '/Views/login.html');
});

app.get('/login', (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.write('<p class="error">Wrong username or password</p>');
})
app.post('/loginProcess', (req, res) => {
    res.setHeader("Content-Type", "text/html");
    let username = req.body.username;
    let password = req.body.password;
    if (username == "test" && password == "test") {
        res.redirect('chat');
        console.log('login complete');
    } else {
        wrong = true
        res.redirect('login');
    }
});

app.get('/register', (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(__dirname + '/Views/register.html');
});
app.post('/registerProcess', (req, res) => {
    res.setHeader("Content-Type", "text/html");
    let username = req.body.username;
    let password = req.body.password;
    if (/* Nom déjà pris */ true) {
        
    } else {
        
    }
});

app.get('/chat', (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(__dirname + '/Views/chat.html');
});

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    })
});


server.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
});