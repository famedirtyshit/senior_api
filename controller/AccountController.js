const { userModel } = require(`../model/User`);
const { postFoundCatModel } = require(`../model/PostFoundCat`);
const { postLostCatModel } = require(`../model/PostLostCat`);
const connectDB = require(`../config/ConnectDB`);
const CryptoJS = require("crypto-js");
const firebase = require('firebase');
const mongoose = require(`mongoose`);

const signup = async (req, res, next) => {
    try {
        connectDB();
        let payload = req.body;
        const bytes = CryptoJS.AES.decrypt(payload.password, process.env.PASS_HASH);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        let user;
        const auth = firebase.auth();
        auth.createUserWithEmailAndPassword(payload.email, originalPassword)
            .then((userCredential) => {
                user = userCredential.user;
                const newUser = new userModel({
                    fbId: user.uid,
                    firstname: payload.firstname,
                    lastname: payload.lastname,
                    phone: payload.phone,
                    facebook: payload.facebook,
                    instagram: payload.instagram,
                });
                let userSaved;
                newUser.save().then(response => {
                    userSaved = response
                    user.sendEmailVerification()
                        .then(() => {
                            res.status(201).json({ result: true, msg: userSaved })
                        })
                        .catch((err) => {
                            console.log(err)
                            // e = new Error(err.body);
                            // e.statusCode = err.statusCode;
                            // next(e);
                            let credential = firebase.auth.EmailAuthProvider.credential(payload.email, originalPassword);
                            user.reauthenticateWithCredential(credential).then(() => {
                                user.delete().then(() => {
                                    userModel.deleteOne({ _id: userSaved._id }, function (err) {
                                        if (err) {
                                            console.log(err)
                                            e = new Error(err.body);
                                            e.message = err.message;
                                            e.statusCode = err.statusCode;
                                            next(e);
                                        } else {
                                            res.status(500).json({ result: false, msg: 'send email verification fail please retry later.' })
                                        }
                                    })
                                }).catch((err) => {
                                    console.log(err)
                                    e = new Error(err.body);
                                    e.message = err.message;
                                    e.statusCode = err.statusCode;
                                    next(e);
                                });
                            }).catch(err => {
                                console.log(err)
                                e = new Error(err.body);
                                e.message = err.message;
                                e.statusCode = err.statusCode;
                                next(e);
                            })
                        });
                }).catch(err => {
                    console.log(err)
                    let credential = firebase.auth.EmailAuthProvider.credential(payload.email, originalPassword);
                    user.reauthenticateWithCredential(credential).then(() => {
                        user.delete().then(() => {
                            res.status(500).json({ result: false, msg: 'signup user fail please retry later.' })
                        }).catch((err) => {
                            console.log(err)
                            e = new Error(err.body);
                            e.message = err.message;
                            e.statusCode = err.statusCode;
                            next(e);
                        });
                    }).catch(err => {
                        console.log(err)
                        e = new Error(err.body);
                        e.message = err.message;
                        e.statusCode = err.statusCode;
                        next(e);
                    })
                    // console.log(err.message)
                    // e = new Error(err.body);
                    // e.statusCode = err.statusCode;
                    // next(e);
                })
            })
            .catch((err) => {
                console.log(err.message)
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
            });
    } catch (err) {
        console.log(err)
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

const getUser = async (req, res, next) => {
    try {
        connectDB();
        if (!req.params.id) {
            res.status(400).json({ result: false, msg: 'bad request error' })
        }
        userModel.find({ fbId: req.params.id }).exec().then(response => {
            if (response.length < 1) {
                res.status(200).json({ result: false, searchResult: [], message: 'user not found' })
            } else {
                res.status(200).json({ result: true, searchResult: response });
            }
        }).catch(err => {
            console.log(err)
            e = new Error(err.body);
            e.message = err.message;
            e.statusCode = err.statusCode;
            next(e);
        })
    } catch (err) {
        console.log(err)
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

const getMyPost = async (req, res, next) => {
    try {
        connectDB();
        if (!req.params.id) {
            res.status(400).json({ result: false, msg: 'bad request error' })
        }
        let queryFound = postFoundCatModel.find({ owner: mongoose.Types.ObjectId(req.params.id) });
        let queryLost = postLostCatModel.find({ owner: mongoose.Types.ObjectId(req.params.id) });
        const [lostResult, foundResult] = await Promise.all([
            queryLost.exec(),
            queryFound.exec()
        ]);
        res.status(200).json({ result: true, searchResult: { postLost: lostResult, postFound: foundResult } });
    } catch (err) {
        console.log(err)
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

module.exports = { signup, getUser, getMyPost };