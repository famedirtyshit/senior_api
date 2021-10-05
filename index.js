const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
global.XMLHttpRequest = require("xhr2");
const firebaseInit = require('./config/InitFirebase');
const mongoose = require(`mongoose`);
require("firebase/analytics");
const nodemailer = require("nodemailer");
var admin = require("firebase-admin");

const postLostCatRouter = require(`./route/PostLostCatRouter`);
const searchLostCatRouter = require(`./route/SearchLostCatRouter`);
const postFoundCatRouter = require(`./route/PostFoundCatRouter`);
const searchFoundCatRouter = require(`./route/SearchFoundCatRouter`);
const searchAllRouter = require(`./route/SearchAllRouter`);
const accountRouter = require(`./route/AccountRouter`)

app.use(cors({
    origin: 'https://dev-next-cloud-run-4p3fhebxra-as.a.run.app',
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

firebaseInit();
admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.TYPE,
        "project_id": process.env.PROJECT_ID,
        "private_key_id": process.env.PRIVATE_KEY_ID,
        "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.CLIENT_EMAIL,
        "client_id": process.env.CLIENT_ID,
        "auth_uri": process.env.AUTH_URI,
        "token_uri": process.env.TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
    })
});

app.get(`/`, (req, res) => {
    res.send(`Hello World !`);
})

app.use(`/postLostCat`, postLostCatRouter);

app.use(`/searchLostCat`, searchLostCatRouter);

app.use(`/postFoundCat`, postFoundCatRouter);

app.use(`/searchFoundCat`, searchFoundCatRouter);

app.use(`/searchAll`, searchAllRouter);

app.use(`/account`, accountRouter);

// app.get('/testMail', (req, res) => {
//     admin
//         .auth()
//         .getUser('v4P5VXzXDNZx5oObwkoszITkoD62')
//         .then((userRecord) => {
//             // See the UserRecord reference doc for the contents of userRecord.
//             let transporter = nodemailer.createTransport({
//                 host: 'gmail',
//                 service: 'Gmail',
//                 auth: {
//                     user: 'catusservice@gmail.com',
//                     pass: 'Catus6108',
//                 },
//             });

//             transporter.sendMail({
//                 from: 'catusservice@gmail.com',   // ผู้ส่ง
//                 to: userRecord.toJSON().email,// ผู้รับ
//                 subject: "สวัสดีจ้าDynamic",                      // หัวข้อ
//                 text: "สวัสดีนะ",                         // ข้อความ
//                 html: `<b>สวัสดี</b>ครับ<br>
//             <img src='https://media.giphy.com/media/TfY3cjjH0aYopkybqc/giphy.gif'>`,                // ข้อความ
//             }, (err, info) => {
//                 if (err) {
//                     res.json({ result: false, detail: err })
//                 } else {
//                     console.log(info.messageId);
//                     res.json({ result: info.messageId, detail: info });
//                 }
//             });
//         })
//         .catch((error) => {
//             res.json({ result: false });
//             console.log('Error fetching user data:', error);
//             return;
//         });
// });

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
        origin: 'https://dev-next-cloud-run-4p3fhebxra-as.a.run.app',
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