const { postFoundCatModel } = require(`../model/PostFoundCat`);
const connectDB = require(`../config/ConnectDB`);
const firebase = require('firebase/app');
require("firebase/storage");
fs = require('fs');
const { testColModel } = require(`../model/TestCol`);
const mongoose = require(`mongoose`);

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
                                                        newPostFoundCat.urls.push({ url: url })
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

const testdelete = async (req, res, next) => {
        try {
                connectDB();
                postFoundCatModel.findOneAndDelete({ _id: '61267e97b0112967b6d85526' }).exec().then(result => {
                        // console.log(result)
                        // console.log('----------------')
                        res.status(200).json({ msg: 'delete', result: result });
                }).catch(err => {
                        e = new Error(err.body);
                        e.statusCode = err.statusCode;
                        next(e);
                })
        } catch (err) {
                e = new Error(err.body);
                e.statusCode = err.statusCode;
                next(e);
        }
}

const testCheck = async (req, res, next) => {
        try {
                connectDB();
                let foundPostCheckStatus = '61267e79b0112967b6d85525'
                testColModel.findOneAndUpdate({ _id: '612a57eba169a25ee6ae8a8d'}, { $set: { "post.$[element].status": false } }, {
                        upsert: true,
                        arrayFilters: [{"element.postId" : mongoose.Types.ObjectId(foundPostCheckStatus)}]
                }, (err, result) => {
                        if (err) {
                                e = new Error(err.body);
                                e.statusCode = err.statusCode;
                                next(e);
                                console.log('------------')
                                console.log('set status noti fail')
                                console.log(err)
                                console.log('------------')
                        } else {
                                let foundPostDetail = null;
                                result.post.map((item) => {
                                        if (item.postId.toString() == foundPostCheckStatus.toString()) {
                                                foundPostDetail = item;
                                                return;
                                        }
                                })
                                res.status(200).json({ result: true, updateResult: foundPostDetail })
                                console.log(result)
                                console.log('------------')
                        }
                })
        } catch (err) {
                console.log(err)
                e = new Error(err.body);
                e.statusCode = err.statusCode;
                next(e);
        }
}





module.exports = { postFoundCat, testdelete, testCheck };