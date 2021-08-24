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

app.use(cors({
    origin: 'https://dev-next-cloud-run-4p3fhebxra-as.a.run.app',
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

app.listen(8000);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        result: false,
        message: err.message,
        stack: err.stack
    });
});

exports.catusService = app;