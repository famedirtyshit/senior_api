const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
global.XMLHttpRequest = require("xhr2");
const firebaseInit = require('./config/InitFirebase');
require("firebase/analytics");

const postLostCatRouter = require(`./route/PostLostCatRouter`);
const searchLostCatRouter = require(`./route/SearchLostCatRouter`);
const postFoundCatRouter = require(`./route/PostFoundCatRouter`);
const searchFoundCatRouter = require(`./route/SearchFoundCatRouter`);

app.use(cors({
    origin: 'https://dev-next-cloud-run-4p3fhebxra-as.a.run.app',
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

firebaseInit();

app.get(`/`, (req, res) => {
    res.send(`Hello World from Cloud Express.js async await`);
})

app.use(`/postLostCat`, postLostCatRouter);

app.use(`/searchLostCat`, searchLostCatRouter);

app.use(`/postFoundCat`, postFoundCatRouter);

app.use(`/searchFoundCat`, searchFoundCatRouter);

// app.post(`/testLocation`,(req,res) => {
//     connectDB();
//     let message = new Message({
//         name: true,
//         location: {
//             type: "Point",
//             coordinates: [100.67747, 13.61863]
//         }
//     })
//     message.save((err,msg) => {
//         if(err) {
//             res.status(500).send(msg);
//             console.log(msg);
//         }else{
//             res.status(201).send(msg);
//             console.log(msg);
//         }
//     })
// });

// app.get(`/getLocation`,(req,res) => {
//     connectDB();
//     let query = Message.find({
//         location: {
//          $near: {
//           $maxDistance: 1000,
//           $geometry: {
//            type: "Point",
//            coordinates: [100.67956, 13.62151]
//           }
//          }
//         }
//        })

//        query.where('name').equals(true);

//        query.exec().then(response => {
//         res.status(200).send(response);
//         })
//         .catch(err => {
//             res.status(500).send(response);
//         });

// })

app.listen(8000);
// const builderFunction = functions.region('asia-east2').https;
// exports.catusService = builderFunction.onRequest(app);
exports.catusService = app;