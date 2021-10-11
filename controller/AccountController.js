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
        queryFound.where('status').equals('active');
        queryLost.where('status').equals('active');
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

const getMyInactivePost = async (req, res, next) => {
    try {
        connectDB();
        if (!req.params.id) {
            res.status(400).json({ result: false, msg: 'bad request error' })
        }
        let queryFound = postFoundCatModel.find({ owner: mongoose.Types.ObjectId(req.params.id) });
        let queryLost = postLostCatModel.find({ owner: mongoose.Types.ObjectId(req.params.id) });
        queryFound.where('status').equals('inactive');
        queryLost.where('status').equals('inactive');
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

const getMyDashboard = async (req, res, next) => {
    try {
        connectDB();
        if (!req.params.id) {
            res.status(400).json({ result: false, msg: 'bad request error' })
        }
        let query = postLostCatModel.find({ owner: mongoose.Types.ObjectId(req.params.id) });
        let result = await query.exec();
        res.status(200).json({ result: true, searchResult: result });
    } catch (err) {
        console.log(err)
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

const edit = async (req, res, next) => {
    try {
        const payload = req.body;
        if (!payload.id || !payload.cipherCredential || !payload.firstname || !payload.lastname || !payload.phone) {
            res.status(400).json({ result: false, msg: 'bad request error' })
        }
        const bytes = CryptoJS.AES.decrypt(payload.cipherCredential, process.env.PASS_HASH);
        const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
        if (payload.id != originalCredential) {
            res.status(403).json({ result: false, msg: 'you don\'t have access' })
        }
        connectDB();
        let updateRes = await userModel.findByIdAndUpdate(mongoose.Types.ObjectId(payload.id), { firstname: payload.firstname, lastname: payload.lastname, phone: payload.phone, facebook: payload.facebook, instagram: payload.instagram }, { new: true }).exec();
        if (updateRes == null) {
            res.status(500).json({ result: false, msg: 'user not exist', updateResult: updateRes })
        } else {
            res.status(200).json({ result: true, msg: 'update success', updateResult: updateRes })
        }
    } catch (err) {
        console.log(err)
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

const changeThumbnail = async (req, res, next) => {
    try {
        const payload = {};
        let filePayload = [];
        for (let i = 0; i < req.formData.length; i++) {
            if (req.formData[i].type == undefined) {
                payload[req.formData[i].name] = req.formData[i].data.toString('utf-8');
            } else {
                filePayload.push(req.formData[i]);
            }
        }
        if (filePayload.length < 1 || !payload.owner || !payload.cipherCredential) {
            res.status(400).json({ result: false, msg: 'please input correct data' })
        }
        const bytes = CryptoJS.AES.decrypt(payload.cipherCredential, process.env.PASS_HASH);
        const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
        if (payload.owner != originalCredential) {
            res.status(403).json({ result: false, msg: 'you don\'t have access' })
        }
        connectDB();
        let firebaseStorage = firebase.storage();
        let ref = firebaseStorage.ref();
        let userTarget = await userModel.findById(mongoose.Types.ObjectId(payload.owner)).exec();
        if (!userTarget) {
            res.status(500).json({ result: false, updateResult: null, msg: 'user not exist' });
            return;
        }
        let thumbnailObj = [];
        for (let i = 0; i < filePayload.length; i++) {
            try {
                let fileRef = ref.child('user/' + payload.owner + '/' + 'thumbnail')
                let putRes = await fileRef.put(filePayload[i].data, { contentType: 'image/png' })
                let url = await putRes.ref.getDownloadURL();
                thumbnailObj = { url: url };
            } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
            }
        }
        let updateRes = await userModel.findByIdAndUpdate(mongoose.Types.ObjectId(payload.owner), { $set: { thumbnail: thumbnailObj } }, { new: true }).exec();
        res.status(200).json({ result: true, updateResult: updateRes });
    } catch (err) {
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

module.exports = { signup, getUser, getMyPost, getMyDashboard, edit, changeThumbnail, getMyInactivePost };