const functions = require("firebase-functions");
const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
const postLostCatRouter = require(`./route/PostLostCatRouter`);
const searchLostCatRouter = require(`./route/SearchLostCatRouter`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`/`,(req,res)=>{
    res.send(`Hello World from Express.js`);
})

app.use(`/postLostCat`,postLostCatRouter);

app.use(`/searchLostCat`,searchLostCatRouter);

app.listen(8000);
const builderFunction = functions.region('asia-east2').https;
exports.catusService = builderFunction.onRequest(app);
