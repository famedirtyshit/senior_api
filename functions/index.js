const functions = require("firebase-functions");
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

firebaseInit();

app.get(`/`,(req,res)=>{
    res.send(`Hello World from Express.js`);
})

app.use(`/postLostCat`,postLostCatRouter);

app.use(`/searchLostCat`,searchLostCatRouter);

app.use(`/postFoundCat`,postFoundCatRouter);

app.use(`/searchFoundCat`,searchFoundCatRouter);

app.listen(8000);
const builderFunction = functions.region('asia-east2').https;
exports.catusService = builderFunction.onRequest(app);
