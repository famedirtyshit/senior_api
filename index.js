const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
global.XMLHttpRequest = require("xhr2");
const firebaseInit = require('./config/InitFirebase');
const mongoose = require(`mongoose`);
require("firebase/analytics");

const postLostCatRouter = require(`./route/PostLostCatRouter`);
const searchLostCatRouter = require(`./route/SearchLostCatRouter`);
const postFoundCatRouter = require(`./route/PostFoundCatRouter`);
const searchFoundCatRouter = require(`./route/SearchFoundCatRouter`);
const searchAllRouter = require(`./route/SearchAllRouter`);
const accountRouter = require(`./route/AccountRouter`)
const reportPostRouter = require(`./route/ReportPostRouter`);
const adminRouter = require(`./route/AdminRouter`);

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

firebaseInit();

app.get(`/`, (req, res) => {
    res.send(`Hello World !`);
})

app.use(`/postLostCat`, postLostCatRouter);

app.use(`/searchLostCat`, searchLostCatRouter);

app.use(`/postFoundCat`, postFoundCatRouter);

app.use(`/searchFoundCat`, searchFoundCatRouter);

app.use(`/searchAll`, searchAllRouter);

app.use(`/account`, accountRouter);

app.use(`/reportPost`, reportPostRouter);

app.use(`/admin`, adminRouter);

app.all('*', (req, res, next) => {
    const err = new Error(`path ${req.path} not found.`)
    err.statusCode = 404;
    next(err);
})

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});

// let appListen = app.listen(8000);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        result: false,
        message: err.message,
        stack: err.stack
    });
});

const server = require('http').createServer(app);
io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
sessionMap = new Map();
io.on('connection', (socket) => {

    socket.on('saveSession', (userId) => {
        if (sessionMap.get(userId) == undefined) {
            sessionMap.set(userId, [socket.id]);
        } else {
            let allSession = sessionMap.get(userId);
            allSession.push(socket.id);
            sessionMap.set(userId, allSession);
        }
    })

    socket.on('disconnect', () => {
        let target;
        for (let [key, value] of sessionMap.entries()) {
            for (let i = 0; i < value.length; i++) {
                if (value[i] == socket.id) {
                    target = { key: key, index: i };
                    break;
                }
            }
        }
        if (target != undefined) {
            if (sessionMap.get(target.key).length < 2) {
                sessionMap.delete(target.key);
            } else {
                sessionMap.get(target.key).splice(target.index, 1);
            }
        }
    })

})

const port = process.env.PORT || 8080;

server.listen(port);
// app.listen(port);



exports.catusService = app;