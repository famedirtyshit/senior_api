const functions = require("firebase-functions");
const express = require('express');
const app = express();
require('dotenv').config()
const postLostCatRouter = require(`./route/PostLostCatRouter`);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`/`,(req,res)=>{
    res.send(`Hello World from Express.js`);
})

app.use(`/postLostCat`,postLostCatRouter);


app.listen(8000);
exports.catusService = functions.https.onRequest(app);
