const { postFoundCatModel } = require(`../model/PostFoundCat`);
const connectDB = require(`../config/ConnectDB`);
const firebase = require('firebase/app');
require("firebase/storage");
fs = require('fs');

const postFoundCat = async (req, res) => {
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
                if (payload.district && payload.date) {
                        const newPostFoundCat = new postFoundCatModel({
                                district: payload.district,
                                date: payload.date,
                                sex: payload.sex,
                                collar: payload.collar,
                                description: payload.description,
                        });
                        if (filePayload.length > 0) {
                                let firebaseStorage = firebase.storage();
                                let ref = firebaseStorage.ref();
                                if (filePayload.length < 6) {
                                        for (let i = 0; i < filePayload.length; i++) {
                                                let fileRef = ref.child('found/' + newPostFoundCat._id + '/' + filePayload[i].filename)
                                                try {
                                                        let putRes = await fileRef.put(filePayload[i].data)
                                                        let url = await putRes.ref.getDownloadURL();
                                                        newPostFoundCat.urls.push({ url: url })
                                                        if (i == filePayload.length - 1) {
                                                                newPostFoundCat.save()
                                                                        .then(response => {
                                                                                res.status(201).json({ result: true, msg: response })
                                                                        })
                                                                        .catch(err => {
                                                                                res.status(500).json({ result: false, msg: 'post fail ' + err.message });
                                                                        })
                                                        }
                                                } catch (e) {
                                                        res.status(500).json({ result: false, msg: 'upload picture fail ' + e });
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
                                                res.status(500).json({ result: false, msg: 'post fail ' + err.message });
                                        })
                        }
                }
                else {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
        } catch (e) {
                res.status(500).json({ result: false, msg: e })
        }
}





module.exports = { postFoundCat };