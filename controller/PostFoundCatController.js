const { postFoundCatModel } = require(`../model/PostFoundCat`);
const connectDB = require(`../config/ConnectDB`);
const firebase = require('firebase/app');
require("firebase/storage");
fs = require('fs');
const { testColModel } = require(`../model/TestCol`);
const mongoose = require(`mongoose`);
const CryptoJS = require("crypto-js");

const postFoundCat = async (req, res, next) => {
        let e;
        try {
                connectDB();
                const payload = {};
                let filePayload = [];
                for (let i = 0; i < req.formData.length; i++) {
                        if (req.formData[i].type == undefined) {
                                payload[req.formData[i].name] = req.formData[i].data.toString('utf-8');
                        } else {
                                filePayload.push(req.formData[i]);
                        }
                }
                if (payload.lat && payload.date && payload.lng) {
                        const newPostFoundCat = new postFoundCatModel({
                                location: { type: "Point", coordinates: [payload.lng, payload.lat] },
                                date: payload.date,
                                sex: payload.sex,
                                collar: payload.collar,
                                description: payload.description,
                                owner: mongoose.Types.ObjectId(payload.owner)
                        });
                        if (filePayload.length > 0) {
                                let firebaseStorage = firebase.storage();
                                let ref = firebaseStorage.ref();
                                if (filePayload.length < 6) {
                                        for (let i = 0; i < filePayload.length; i++) {
                                                let fileRef = ref.child('found/' + newPostFoundCat._id + '/' + filePayload[i].name)
                                                try {
                                                        let putRes = await fileRef.put(filePayload[i].data, { contentType: 'image/png' })
                                                        let url = await putRes.ref.getDownloadURL();
                                                        newPostFoundCat.urls.push({ url: url, fileName: filePayload[i].name })
                                                        if (i == filePayload.length - 1) {
                                                                newPostFoundCat.save()
                                                                        .then(response => {
                                                                                res.status(201).json({ result: true, msg: response })
                                                                        })
                                                                        .catch(err => {
                                                                                e = new Error(err.body);
                                                                                e.message = err.message;
                                                                                e.statusCode = err.statusCode;
                                                                                next(e);
                                                                        })
                                                        }
                                                } catch (err) {
                                                        e = new Error(err.body);
                                                        e.message = err.message;
                                                        e.statusCode = err.statusCode;
                                                        next(e);
                                                }
                                        }
                                } else {
                                        res.status(500).json({ result: false, msg: 'number of uploaded picture exceed ' });
                                }
                        } else {
                                newPostFoundCat.save()
                                        .then(response => {
                                                res.status(201).json({ result: true, msg: response })
                                        })
                                        .catch(err => {
                                                e = new Error(err.body);
                                                e.message = err.message;
                                                e.statusCode = err.statusCode;
                                                next(e);
                                        })
                        }
                }
                else {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const updatePostFoundCat = async (req, res, next) => {
        try {
                connectDB();
                const payload = req.body;
                if (!payload.date || !payload.sex || !payload.collar || !payload.description || !payload.owner || !payload.credential || !payload.postId) {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
                const bytes = CryptoJS.AES.decrypt(payload.credential, process.env.PASS_HASH);
                const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
                if (payload.owner != originalCredential) {
                        res.status(403).json({ result: false, msg: 'you don\'t have access' })
                }
                let updateRes = await postFoundCatModel.findByIdAndUpdate(mongoose.Types.ObjectId(payload.postId), { date: payload.date, sex: payload.sex, collar: payload.collar, description: payload.description }, { new: true }).exec();
                if (updateRes == null) {
                        res.status(500).json({ result: false, msg: 'post not exist', updateResult: updateRes })
                } else {
                        res.status(200).json({ result: true, msg: 'update success', updateResult: updateRes })
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const addImagePostFoundCat = async (req, res, next) => {
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
                if (filePayload.length < 1 || !payload.owner || !payload.cipherCredential || !payload.postId) {
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
                let postTarget = await postFoundCatModel.findById(mongoose.Types.ObjectId(payload.postId)).exec();
                if (!postTarget) {
                        res.status(500).json({ result: false, updateResult: null, msg: 'post not exist' });
                        return;
                }
                if (filePayload.length + postTarget.urls.length < 6) {
                        let allNewUrls = [];
                        for (let i = 0; i < filePayload.length; i++) {
                                try {
                                        let fileRef = ref.child('found/' + postTarget._id + '/' + filePayload[i].name)
                                        let putRes = await fileRef.put(filePayload[i].data, { contentType: 'image/png' })
                                        let url = await putRes.ref.getDownloadURL();
                                        allNewUrls.push({ url: url, fileName: filePayload[i].name });
                                } catch (err) {
                                        e = new Error(err.body);
                                        e.message = err.message;
                                        e.statusCode = err.statusCode;
                                        next(e);
                                }
                        }
                        let updateRes = await postFoundCatModel.findByIdAndUpdate(mongoose.Types.ObjectId(payload.postId), { $push: { urls: allNewUrls } }, { new: true }).exec();
                        res.status(200).json({ result: true, updateResult: updateRes, newImages: allNewUrls });
                } else {
                        res.status(400).json({ result: false, msg: 'number of uploaded picture exceed ' });
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const deleteImagePostFoundCat = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential || !payload.fileRef) {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
                connectDB();
                let postTarget = await postFoundCatModel.findById(mongoose.Types.ObjectId(payload.postId)).exec();
                if (!postTarget) {
                        res.status(500).json({ result: false, updateResult: null, msg: 'post not exist' });
                        return;
                }
                const bytes = CryptoJS.AES.decrypt(payload.credential, process.env.PASS_HASH);
                const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
                if (postTarget.owner.toString() != originalCredential) {
                        res.status(403).json({ result: false, msg: 'you don\'t have access' })
                }
                let updateRes = await postFoundCatModel.findByIdAndUpdate(mongoose.Types.ObjectId(payload.postId), { $pull: { urls: { fileName: payload.fileRef } } }, { new: true }).exec();
                let firebaseStorage = firebase.storage();
                let ref = firebaseStorage.ref();
                let fileRef = ref.child('found/' + payload.postId + '/' + payload.fileRef);
                fileRef.delete().then(() => {
                        res.status(200).json({ result: true, updateResult: updateRes });
                }).catch((err) => {
                        e = new Error(err.body);
                        e.message = err.message;
                        e.statusCode = err.statusCode;
                        next(e);
                })
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const deletePostFoundCat = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential) {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
                connectDB();
                let postTarget = await postFoundCatModel.findById(mongoose.Types.ObjectId(payload.postId)).exec();
                if (!postTarget) {
                        res.status(500).json({ result: false, updateResult: null, msg: 'post not exist' });
                        return;
                }
                const bytes = CryptoJS.AES.decrypt(payload.credential, process.env.PASS_HASH);
                const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
                if (postTarget.owner.toString() != originalCredential) {
                        res.status(403).json({ result: false, msg: 'you don\'t have access' })
                }
                let deleteResult = await postFoundCatModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(payload.postId) }).exec();
                let firebaseStorage = firebase.storage();
                let ref = firebaseStorage.ref();
                for (let i = 0; i < postTarget.urls.length; i++) {
                        let refString = `found/${payload.postId}/${postTarget.urls[i].fileName}`;
                        let fileRef = ref.child(refString);
                        fileRef.delete().then(() => {
                        }).catch((err) => {
                                e = new Error(err.body);
                                e.message = err.message;
                                e.statusCode = err.statusCode;
                                next(e);
                        })
                }
                res.status(200).json({ result: true, deleteResult: deleteResult });
        } catch (err) {
                e = new Error(err.body);
                e.statusCode = err.statusCode;
                next(e);
        }
}

module.exports = { postFoundCat, updatePostFoundCat, addImagePostFoundCat, deleteImagePostFoundCat, deletePostFoundCat };