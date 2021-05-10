const { postFoundCatModel } = require(`../model/PostFoundCat`);
const connectDB = require(`../config/ConnectDB`);
const firebase = require('firebase/app');
require("firebase/storage");

const postFoundCat = async (req, res) => {
        try {
                connectDB();
                const payload = req.body
                if (payload.district && payload.date) {
                        const newPostFoundCat = new postFoundCatModel({
                                district: payload.district,
                                date: payload.date,
                                sex: payload.sex,
                                collar: payload.collar,
                                description: payload.description,
                        });
                        let fileUpload = req.files;
                        if (fileUpload.length > 0 && fileUpload.length < 6) {
                                let firebaseStorage = firebase.storage();
                                let ref = firebaseStorage.ref();
                                for (let i = 0; i < fileUpload.length; i++) {
                                        let fileRef = ref.child('found/' + newPostFoundCat._id + '/' + fileUpload[i].originalname)
                                        await fileRef.put(fileUpload[i].buffer).then(async (res) => {
                                               let url = await res.ref.getDownloadURL();
                                               newPostFoundCat.urls.push({url : url})
                                        }).catch(e => {
                                                res.status(500).json({ result: false, msg: 'upload picture fail ' + e });
                                        });
                                }
                        }
                        newPostFoundCat.save()
                                .then(response => {
                                        res.status(201).json({ result: true, msg: response })
                                })
                                .catch(err => {
                                        res.status(500).json({ result: false, msg: 'post fail ' + err.message });
                                })
                } else {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
        } catch (e) {
                res.status(500).json({ result: false, msg: e })
        }
}





module.exports = { postFoundCat };