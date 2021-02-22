const functions = require("firebase-functions");
const express = require('express');
const app = express();
require('dotenv').config()


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`/`,(req,res)=>{
    res.send(`Hello World from Express.js`);
})


app.listen(8000);
exports.helloWorld = functions.https.onRequest(app);
