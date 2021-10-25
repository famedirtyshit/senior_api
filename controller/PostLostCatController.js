const { postLostCatModel } = require(`../model/PostLostCat`);
const connectDB = require(`../config/ConnectDB`);
const firebase = require('firebase/app');
require("firebase/storage");
fs = require('fs');
const mongoose = require(`mongoose`);
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
let admin = require("firebase-admin");
let dayjs = require('dayjs');

const postLostCat = async (req, res, next) => {
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
                        const newPostLostCat = new postLostCatModel({
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
                                                let fileRef = ref.child('lost/' + newPostLostCat._id + '/' + filePayload[i].name)
                                                try {
                                                        let putRes = await fileRef.put(filePayload[i].data, { contentType: 'image/png' })
                                                        let url = await putRes.ref.getDownloadURL();
                                                        newPostLostCat.urls.push({ url: url, fileName: filePayload[i].name })
                                                        if (i == filePayload.length - 1) {
                                                                newPostLostCat.save()
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
                                newPostLostCat.save()
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

                } else {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const updatePostLostCat = async (req, res, next) => {
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
                let postTarget = await postLostCatModel.findById({ _id: mongoose.Types.ObjectId(payload.postId) }).exec();
                if (postTarget.status == 'active' || postTarget.status == 'inactive') {
                        let updateRes = await postLostCatModel.findByIdAndUpdate(mongoose.Types.ObjectId(payload.postId), { date: payload.date, sex: payload.sex, collar: payload.collar, description: payload.description }, { new: true }).exec();
                        if (updateRes == null) {
                                res.status(500).json({ result: false, msg: 'post not exist', updateResult: updateRes })
                        } else {
                                res.status(200).json({ result: true, msg: 'update success', updateResult: updateRes })
                        }
                } else {
                        res.status(200).json({ result: false, msg: 'can\'t update none active or inactive post' })
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const addImagePostLostCat = async (req, res, next) => {
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
                let postTarget = await postLostCatModel.findById(mongoose.Types.ObjectId(payload.postId)).exec();
                if (!postTarget) {
                        res.status(500).json({ result: false, updateResult: null, msg: 'post not exist' });
                        return;
                }
                if (postTarget.status == 'active' || postTarget.status == 'inactive') {
                        if (filePayload.length + postTarget.urls.length < 6) {
                                let allNewUrls = [];
                                for (let i = 0; i < filePayload.length; i++) {
                                        try {
                                                let fileRef = ref.child('lost/' + postTarget._id + '/' + filePayload[i].name)
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
                                let updateRes = await postLostCatModel.findByIdAndUpdate(mongoose.Types.ObjectId(payload.postId), { $push: { urls: allNewUrls } }, { new: true }).exec();
                                res.status(200).json({ result: true, updateResult: updateRes, newImages: allNewUrls });
                        } else {
                                res.status(400).json({ result: false, msg: 'number of uploaded picture exceed ' });
                        }
                } else {
                        res.status(200).json({ result: false, msg: 'can\'t update none active or inactive post' })
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const deleteImagePostLostCat = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential || !payload.fileRef) {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
                connectDB();
                let postTarget = await postLostCatModel.findById(mongoose.Types.ObjectId(payload.postId)).exec();
                if (!postTarget) {
                        res.status(500).json({ result: false, updateResult: null, msg: 'post not exist' });
                        return;
                }
                if (postTarget.status == 'active' || postTarget.status == 'inactive') {
                        const bytes = CryptoJS.AES.decrypt(payload.credential, process.env.PASS_HASH);
                        const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
                        if (postTarget.owner.toString() != originalCredential) {
                                res.status(403).json({ result: false, msg: 'you don\'t have access' })
                        }
                        let updateRes = await postLostCatModel.findByIdAndUpdate(mongoose.Types.ObjectId(payload.postId), { $pull: { urls: { fileName: payload.fileRef } } }, { new: true }).exec();
                        let firebaseStorage = firebase.storage();
                        let ref = firebaseStorage.ref();
                        let fileRef = ref.child('lost/' + payload.postId + '/' + payload.fileRef);
                        fileRef.delete().then(() => {
                                res.status(200).json({ result: true, updateResult: updateRes });
                        }).catch((err) => {
                                e = new Error(err.body);
                                e.message = err.message;
                                e.statusCode = err.statusCode;
                                next(e);
                        })
                } else {
                        res.status(200).json({ result: false, msg: 'can\'t update none active or inactive post' })
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const deletePostLostCat = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential) {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
                connectDB();
                let postTarget = await postLostCatModel.findById(mongoose.Types.ObjectId(payload.postId)).exec();
                if (!postTarget) {
                        res.status(500).json({ result: false, updateResult: null, msg: 'post not exist' });
                        return;
                }
                if (postTarget.status == 'active' || postTarget.status == 'inactive') {
                        const bytes = CryptoJS.AES.decrypt(payload.credential, process.env.PASS_HASH);
                        const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
                        if (postTarget.owner.toString() != originalCredential) {
                                res.status(403).json({ result: false, msg: 'you don\'t have access' })
                        }
                        let expireDueDate = dayjs(new Date()).add(2592000, 'second').toDate();
                        let deleteResult = await postLostCatModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(payload.postId) }, { status: 'delete', expires: expireDueDate }).exec();
                        let firebaseStorage = firebase.storage();
                        let ref = firebaseStorage.ref();
                        for (let i = 0; i < postTarget.urls.length; i++) {
                                let refString = `lost/${payload.postId}/${postTarget.urls[i].fileName}`;
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
                } else {
                        res.status(200).json({ result: false, msg: 'can\'t update none active or inactive post' })
                }
        } catch (err) {
                e = new Error(err.body);
                e.statusCode = err.statusCode;
                next(e);
        }
}

const sendEmailIdle = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential) {
                        res.status(400).json({ result: false, msg: 'bad request' });
                } else if (payload.credential.toString() != process.env.TRIGGER_VALID_KEY) {
                        res.status(403).json({ result: false, msg: 'you don\'t have access' });
                } else {
                        connectDB();
                        let postIdObjectIdFormat = await payload.postId.map(id => { return mongoose.Types.ObjectId(id) });
                        let allPost;
                        let postResult = await postLostCatModel.find({ _id: postIdObjectIdFormat }).populate('owner').exec();
                        allPost = postResult;
                        if (allPost.length > 0) {
                                allPost.map((post, index) => {
                                        let postCreateDate = new Date(post.createdAt);
                                        let dayObj = dayjs(postCreateDate);
                                        let inactiveDueDate = dayObj.add(2592000, 'second');
                                        let postDateSelected = dayjs(new Date(post.date));
                                        let sendResult = [];
                                        admin.auth()
                                                .getUser(post.owner.fbId)
                                                .then((userRecord) => {
                                                        // See the UserRecord reference doc for the contents of userRecord.
                                                        let transporter = nodemailer.createTransport({
                                                                host: 'gmail',
                                                                service: 'Gmail',
                                                                auth: {
                                                                        user: process.env.CATUS_MAIL_USER,
                                                                        pass: process.env.CATUS_MAIL_PASS,
                                                                },
                                                        });
                                                        if (post.owner.mailSubscribe == true) {
                                                                transporter.sendMail({
                                                                        from: process.env.CATUS_MAIL_USER,   // ผู้ส่ง
                                                                        to: userRecord.toJSON().email,// ผู้รับ
                                                                        subject: "แจ้งเตือนหมดเวลาโพสต์แมวหายของคุณ",                      // หัวข้อ
                                                                        html: `<p><b>โพสต์แมวหายของคุณจะหมดเวลาในวันที่ ${inactiveDueDate.format('DD/MM/YYYY')}</b></p><br>
                                                                        <p>หายวันที่: ${postDateSelected.format('DD/MM/YYYY')}</p><br>
                                                                        <p>เพศ: ${post.sex == 'unknow' ? 'ไม่ทราบ' : post.sex == 'true' ? 'ตัวผู้' : 'ตัวเมีย'}</p><br>
                                                                        <p>ปลอกคอ: ${post.collar == true ? 'มีปลอกคอ' : 'ไม่มีปลอกคอ'}</p><br>
                                                                        <p>คำอธิบายเพิ่มเติม: ${post.description ? post.description : '-'}</p><br><br>
                                                                        ${post.urls.length > 0
                                                                                        ?
                                                                                        post.urls.map(urlObj => {
                                                                                                return `<img style="width:50%;height:auto;display:block;margin-left:auto;margin-right:auto;" src=${urlObj.url} />`
                                                                                        })
                                                                                        :
                                                                                        ''
                                                                                }`,
                                                                }, (err, info) => {
                                                                        if (err) {
                                                                                e = new Error(err.body);
                                                                                e.message = err.message;
                                                                                e.statusCode = err.statusCode;
                                                                                next(e);
                                                                        } else {
                                                                                sendResult.push(info);
                                                                                if (index == allPost.length - 1) {
                                                                                        res.status(200).json({ result: true, detail: sendResult });
                                                                                }
                                                                        }
                                                                });
                                                        } else {
                                                                if (index == allPost.length - 1) {
                                                                        res.status(200).json({ result: true, detail: sendResult });
                                                                }
                                                        }
                                                })
                                                .catch((err) => {
                                                        e = new Error(err.body);
                                                        e.message = err.message;
                                                        e.statusCode = err.statusCode;
                                                        next(e);
                                                });
                                })
                        } else {
                                res.status(200).json({ result: true, detail: 'no match post' });
                        }
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const sendEmailInactive = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential) {
                        res.status(400).json({ result: false, msg: 'bad request' });
                } else if (payload.credential.toString() != process.env.TRIGGER_VALID_KEY) {
                        res.status(403).json({ result: false, msg: 'you don\'t have access' });
                } else {
                        connectDB();
                        let postIdObjectIdFormat = await payload.postId.map(id => { return mongoose.Types.ObjectId(id) });
                        let allPost;
                        let postResult = await postLostCatModel.find({ _id: postIdObjectIdFormat }).populate('owner').exec();
                        allPost = postResult;
                        if (allPost.length > 0) {
                                allPost.map((post, index) => {
                                        let postCreateDate = new Date(post.createdAt);
                                        let dayObj = dayjs(postCreateDate);
                                        let inactiveDueDate = dayObj.add(3196800, 'second');
                                        let postDateSelected = dayjs(new Date(post.date));
                                        let sendResult = [];
                                        admin.auth()
                                                .getUser(post.owner.fbId)
                                                .then((userRecord) => {
                                                        // See the UserRecord reference doc for the contents of userRecord.
                                                        let transporter = nodemailer.createTransport({
                                                                host: 'gmail',
                                                                service: 'Gmail',
                                                                auth: {
                                                                        user: process.env.CATUS_MAIL_USER,
                                                                        pass: process.env.CATUS_MAIL_PASS,
                                                                },
                                                        });
                                                        if (post.owner.mailSubscribe == true) {
                                                                transporter.sendMail({
                                                                        from: process.env.CATUS_MAIL_USER,   // ผู้ส่ง
                                                                        to: userRecord.toJSON().email,// ผู้รับ
                                                                        subject: "แจ้งเตือนโพสต์แมวหายของคุณอยู่ในสถานะไม่ได้ใช้งาน",                      // หัวข้อ
                                                                        html: `<p><b>โพสต์แมวหายของคุณอยู่ในสถานะไม่ได้ใช้งาน หากต้องการประกาศโพสต์นี้อีกครั้งกรุณาดำเนินการที่เว็บไซต์ <span><a href="https://dev-next-cloud-run-4p3fhebxra-as.a.run.app">CatUs</a></span> โดยโพสนี้จะหมดอายุในวันที่ ${inactiveDueDate.format('DD/MM/YYYY')}</b></p><br>
                                                                        <p>หายวันที่: ${postDateSelected.format('DD/MM/YYYY')}</p><br>
                                                                        <p>เพศ: ${post.sex == 'unknow' ? 'ไม่ทราบ' : post.sex == 'true' ? 'ตัวผู้' : 'ตัวเมีย'}</p><br>
                                                                        <p>ปลอกคอ: ${post.collar == true ? 'มีปลอกคอ' : 'ไม่มีปลอกคอ'}</p><br>
                                                                        <p>คำอธิบายเพิ่มเติม: ${post.description ? post.description : '-'}</p><br><br>
                                                                        ${post.urls.length > 0
                                                                                        ?
                                                                                        post.urls.map(urlObj => {
                                                                                                return `<img style="width:50%;height:auto;display:block;margin-left:auto;margin-right:auto;" src=${urlObj.url} />`
                                                                                        })
                                                                                        :
                                                                                        ''
                                                                                }`,
                                                                }, (err, info) => {
                                                                        if (err) {
                                                                                e = new Error(err.body);
                                                                                e.message = err.message;
                                                                                e.statusCode = err.statusCode;
                                                                                next(e);
                                                                        } else {
                                                                                sendResult.push(info);
                                                                                if (index == allPost.length - 1) {
                                                                                        res.status(200).json({ result: true, detail: sendResult });
                                                                                }
                                                                        }
                                                                });
                                                        } else {
                                                                if (index == allPost.length - 1) {
                                                                        res.status(200).json({ result: true, detail: sendResult });
                                                                }
                                                        }
                                                })
                                                .catch((err) => {
                                                        e = new Error(err.body);
                                                        e.message = err.message;
                                                        e.statusCode = err.statusCode;
                                                        next(e);
                                                });
                                })
                        } else {
                                res.status(200).json({ result: true, detail: 'no match post' });
                        }
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const sendEmailExpire = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential) {
                        res.status(400).json({ result: false, msg: 'bad request' });
                } else if (payload.credential.toString() != process.env.TRIGGER_VALID_KEY) {
                        res.status(403).json({ result: false, msg: 'you don\'t have access' });
                } else {
                        connectDB();
                        let postIdObjectIdFormat = await payload.postId.map(id => { return mongoose.Types.ObjectId(id) });
                        let allPost;
                        let postResult = await postLostCatModel.find({ _id: postIdObjectIdFormat }).populate('owner').exec();
                        allPost = postResult;
                        if (allPost.length > 0) {
                                let bucket = admin.storage().bucket();
                                allPost.map((post, index) => {
                                        bucket.deleteFiles({
                                                prefix: `lost/${post._id.toString()}`
                                        }, function (err) {
                                                if (err) {
                                                        e = new Error(err.body);
                                                        e.message = err.message;
                                                        e.statusCode = err.statusCode;
                                                        next(e);
                                                }
                                        });
                                        let postDateSelected = dayjs(new Date(post.date));
                                        let sendResult = [];
                                        admin.auth()
                                                .getUser(post.owner.fbId)
                                                .then((userRecord) => {
                                                        // See the UserRecord reference doc for the contents of userRecord.
                                                        let transporter = nodemailer.createTransport({
                                                                host: 'gmail',
                                                                service: 'Gmail',
                                                                auth: {
                                                                        user: process.env.CATUS_MAIL_USER,
                                                                        pass: process.env.CATUS_MAIL_PASS,
                                                                },
                                                        });
                                                        if (post.owner.mailSubscribe == true) {
                                                                transporter.sendMail({
                                                                        from: process.env.CATUS_MAIL_USER,   // ผู้ส่ง
                                                                        to: userRecord.toJSON().email,// ผู้รับ
                                                                        subject: "แจ้งเตือนโพสต์แมวหายของคุณหมดอายุ",                      // หัวข้อ
                                                                        html: `<p><b>โพสต์แมวหายของคุณหมดอายุแล้ว</b></p><br>
                                                                        <p>หายวันที่: ${postDateSelected.format('DD/MM/YYYY')}</p><br>
                                                                        <p>เพศ: ${post.sex == 'unknow' ? 'ไม่ทราบ' : post.sex == 'true' ? 'ตัวผู้' : 'ตัวเมีย'}</p><br>
                                                                        <p>ปลอกคอ: ${post.collar == true ? 'มีปลอกคอ' : 'ไม่มีปลอกคอ'}</p><br>
                                                                        <p>คำอธิบายเพิ่มเติม: ${post.description ? post.description : '-'}</p><br><br>`,
                                                                }, (err, info) => {
                                                                        if (err) {
                                                                                e = new Error(err.body);
                                                                                e.message = err.message;
                                                                                e.statusCode = err.statusCode;
                                                                                next(e);
                                                                        } else {
                                                                                sendResult.push(info);
                                                                                if (index == allPost.length - 1) {
                                                                                        res.status(200).json({ result: true, detail: sendResult });
                                                                                }
                                                                        }
                                                                });
                                                        } else {
                                                                if (index == allPost.length - 1) {
                                                                        res.status(200).json({ result: true, detail: sendResult });
                                                                }
                                                        }
                                                })
                                                .catch((err) => {
                                                        e = new Error(err.body);
                                                        e.message = err.message;
                                                        e.statusCode = err.statusCode;
                                                        next(e);
                                                });
                                })
                        } else {
                                res.status(200).json({ result: true, detail: 'no match post' });
                        }
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const extendPost = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential) {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
                const bytes = CryptoJS.AES.decrypt(payload.credential, process.env.PASS_HASH);
                const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
                connectDB();
                let postTarget = await postLostCatModel.findById({ _id: mongoose.Types.ObjectId(payload.postId) }).populate('owner').exec();
                if (postTarget.owner._id != originalCredential) {
                        res.status(403).json({ result: false, msg: 'you don\'t have access' })
                        return;
                }
                if (postTarget.status == 'active' || postTarget.status == 'inactive') {
                        let newDate = new Date();
                        let updateRes = await postLostCatModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(payload.postId) }, { createdAt: newDate, status: 'active', idle: false }, { new: true, timestamps: false }).exec();
                        res.status(200).json({ result: true, updateResult: updateRes });
                } else {
                        res.status(200).json({ result: false, updateResult: 'can\'t update none active or inactive post' });
                }
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const completePost = async (req, res, next) => {
        try {
                const payload = req.body;
                if (!payload.postId || !payload.credential) {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
                connectDB();
                let postTarget = await postLostCatModel.findById(mongoose.Types.ObjectId(payload.postId)).exec();
                if (!postTarget) {
                        res.status(500).json({ result: false, updateResult: null, msg: 'post not exist' });
                        return;
                }
                if (postTarget.status == 'active' || postTarget.status == 'inactive') {
                        const bytes = CryptoJS.AES.decrypt(payload.credential, process.env.PASS_HASH);
                        const originalCredential = bytes.toString(CryptoJS.enc.Utf8);
                        if (postTarget.owner.toString() != originalCredential) {
                                res.status(403).json({ result: false, msg: 'you don\'t have access' })
                        }
                        let expireDueDate = dayjs(new Date()).add(2592000, 'second').toDate();
                        let deleteResult = await postLostCatModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(payload.postId) }, { status: 'complete', expires: expireDueDate }).exec();
                        let firebaseStorage = firebase.storage();
                        let ref = firebaseStorage.ref();
                        for (let i = 0; i < postTarget.urls.length; i++) {
                                let refString = `lost/${payload.postId}/${postTarget.urls[i].fileName}`;
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
                } else {
                        res.status(200).json({ result: false, msg: 'can\'t update none active or inactive post' })
                }
        } catch (err) {
                e = new Error(err.body);
                e.statusCode = err.statusCode;
                next(e);
        }
}

module.exports = { postLostCat, updatePostLostCat, addImagePostLostCat, deleteImagePostLostCat, deletePostLostCat, sendEmailIdle, sendEmailInactive, sendEmailExpire, extendPost, completePost };