const { postLostCatModel } = require(`../model/PostLostCat`);
const connectDB = require(`../config/ConnectDB`);
const firebase = require('firebase/app');
require("firebase/storage");
fs = require('fs');

const postLostCat = async (req, res) => {
        try {
                connectDB();
                const payload = req.body
                if (payload.district && payload.date) {
                        const newPostLostCat = new postLostCatModel({
                                district: payload.district,
                                date: payload.date,
                                sex: payload.sex,
                                collar: payload.collar,
                                description: payload.description,
                        });
                        let filePayload = req.files.null;
                        if (filePayload != undefined) {
                                let firebaseStorage = firebase.storage();
                                let ref = firebaseStorage.ref();
                                if (filePayload.length == undefined) {
                                        let fileRef = ref.child('lost/' + newPostLostCat._id + '/' + filePayload.originalFilename)
                                        fs.readFile(filePayload.path, async function (err, data) {
                                                if (err) {
                                                        res.status(500).json({ result: false, msg: 'upload picture fail ' + err });
                                                } else {
                                                        try {
                                                                let putRes = await fileRef.put(data)
                                                                let url = await putRes.ref.getDownloadURL();
                                                                newPostLostCat.urls.push({ url: url })
                                                                newPostLostCat.save()
                                                                        .then(response => {
                                                                                res.status(201).json({ result: true, msg: response })
                                                                        })
                                                                        .catch(err => {
                                                                                res.status(500).json({ result: false, msg: 'post fail ' + err.message });
                                                                        })
                                                        } catch (e) {
                                                                res.status(500).json({ result: false, msg: 'upload picture fail ' + e });
                                                        }
                                                }
                                        });
                                } else {
                                        if (filePayload.length < 6) {
                                                console.log('>1')
                                                for (let i = 0; i < filePayload.length; i++) {
                                                        let fileRef = ref.child('lost/' + newPostLostCat._id + '/' + filePayload[i].originalFilename)
                                                        fs.readFile(filePayload[i].path, async function (err, data) {
                                                                if (err) {
                                                                        res.status(500).json({ result: false, msg: 'upload picture fail ' + err });
                                                                }
                                                                else {
                                                                        try {
                                                                                let putRes = await fileRef.put(data)
                                                                                let url = await putRes.ref.getDownloadURL();
                                                                                newPostLostCat.urls.push({ url: url })
                                                                                if (i == filePayload.length - 1) {
                                                                                        newPostLostCat.save()
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
                                                        });
                                                }
                                        } else {
                                                res.status(500).json({ result: false, msg: 'number of uploaded picture exceed ' });
                                        }
                                }

                        } else {
                                newPostLostCat.save()
                                        .then(response => {
                                                res.status(201).json({ result: true, msg: response })
                                        })
                                        .catch(err => {
                                                res.status(500).json({ result: false, msg: 'post fail ' + err.message });
                                        })
                        }

                } else {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
        } catch (e) {
                res.status(500).json({ result: false, msg: e })
        }
}





module.exports = { postLostCat };