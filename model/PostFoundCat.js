const mongoose = require(`mongoose`);
const schema = mongoose.Schema;
const geolib = require('geolib');
const { postLostCatModel } = require(`./PostLostCat`);
const nodemailer = require("nodemailer");
let admin = require("firebase-admin");
let dayjs = require('dayjs');

const postFoundCatSchema = new schema({
    postType: { type: String, default: 'found' },
    location: { type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true } },
    date: Date,
    sex: String,
    collar: Boolean,
    description: String,
    urls: [{ url: String, fileName: String }],
    owner: { type: schema.Types.ObjectId, ref: 'users' },
    status: { type: String, default: 'active' },
    idle: { type: Boolean, default: false },
    expires: { type: Date }
}, { timestamps: true })

postFoundCatSchema.index({ location: '2dsphere' })
postFoundCatSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

postFoundCatSchema.methods.checkDistance = (srcLat, srcLng, desLat, desLng) => {
    return geolib.getDistance(
        { latitude: srcLat, longitude: srcLng },
        { latitude: desLat, longitude: desLng }
    );
}

postFoundCatSchema.post('save', function (doc, next) {
    let query = postLostCatModel.find({ status: 'active' });
    query.where('location').equals({
        $near: {
            $maxDistance: 2000,
            $geometry: {
                type: "Point",
                coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]]
            }
        }
    }).exec().then(res => {
        let lostPostInArea = [];
        res.map(post => {
            if (post.owner.toString() != doc.owner.toString()) {
                lostPostInArea.push(post._id);
            }
        })
        postLostCatModel.updateMany({ _id: lostPostInArea }, { $push: { nearFoundCat: { _id: mongoose.Types.ObjectId(doc._id) } } }, null, (err, result) => {
            if (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
                console.log('------------')
                console.log('push array post noti fail')
                console.log(err)
                console.log('------------')
            } else {
                next();
                let allLostPostReceiveMail = new Map();
                res.map(async (lostPost, lostPostIndex) => {
                    if (lostPost.owner.toString() != doc.owner.toString()) {
                        let session = sessionMap.get(lostPost.owner.toString());
                        if (session != undefined && session.length > 0) {
                            session.map(item => {
                                io.to(item).emit('newNearPost', { foundPost: doc, lostPost: lostPost })
                            })
                        }
                        let allLostPostInfo = await postLostCatModel.findById({ _id: mongoose.Types.ObjectId(lostPost._id) }).populate('owner').exec();
                        if (allLostPostInfo) {
                            if (allLostPostReceiveMail.get(allLostPostInfo.owner._id) == undefined) {
                                allLostPostReceiveMail.set(allLostPostInfo.owner._id, allLostPostInfo);
                            }
                        }
                        if (lostPostIndex == res.length - 1) {
                            allLostPostReceiveMail.forEach(lostPostReceiveMail => {
                                console.log(lostPostReceiveMail);
                                console.log('--------')
                                admin.auth()
                                    .getUser(lostPostReceiveMail.owner.fbId)
                                    .then((userRecord) => {
                                        console.log(userRecord);
                                        console.log('--------')
                                        // See the UserRecord reference doc for the contents of userRecord.
                                        if (lostPostReceiveMail.owner.mailSubscribe == true) {
                                            // console.log(lostPostReceiveMail);
                                            // console.log(userRecord);
                                            console.log('true subscribe');
                                            let transporter = nodemailer.createTransport({
                                                host: 'gmail',
                                                service: 'Gmail',
                                                auth: {
                                                    user: process.env.CATUS_MAIL_USER,
                                                    pass: process.env.CATUS_MAIL_PASS,
                                                },
                                            });
                                            transporter.sendMail({
                                                from: process.env.CATUS_MAIL_USER,   // ผู้ส่ง
                                                to: userRecord.toJSON().email,// ผู้รับ
                                                subject: "แจ้งเตือนคนพบแมวใกล้แมวหายของคุณ",                      // หัวข้อ
                                                html: `<p><b>ตรวจสอบโพสต์แมวหายของคุณได้ที่ https://catus-frontend-okqwqdlmsq-as.a.run.app/dashboard</b></p><br>`,
                                            }, (err, info) => {
                                                if (err) {
                                                    e = new Error(err.body);
                                                    e.message = err.message;
                                                    e.statusCode = err.statusCode;
                                                    // next(e);
                                                    console.log('--------')
                                                    console.log(err)
                                                } else {
                                                    // mail sended
                                                    console.log('--------')
                                                    console.log(info)
                                                }
                                            });
                                        }
                                    })
                                    .catch((err) => {
                                        e = new Error(err.body);
                                        e.message = err.message;
                                        e.statusCode = err.statusCode;
                                        // next(e);
                                        console.log(err)
                                    });
                            })
                        }
                    }
                })
            }
        })
    }).catch(err => {
        console.log('error in middle')
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    })
})

postFoundCatSchema.post('findOneAndUpdate', async function (next) {
    try {
        let postTarget = await postFoundCatModel.findById(mongoose.Types.ObjectId(this.getQuery()["_id"])).exec();
        if (postTarget.status == 'delete' || postTarget.status == 'complete' || postTarget.status == 'deleteByAdmin') {
            const queryId = this.getQuery()["_id"];
            postLostCatModel.updateMany({ 'nearFoundCat._id': queryId }, { $pull: { nearFoundCat: { _id: queryId } } }, null, (err, res) => {
                if (err) {
                    console.log(err)
                    e = new Error(err.body);
                    e.statusCode = err.statusCode;
                    next(e);
                }
            })
        }
    } catch (err) {
        console.log('error in middle')
        console.log(err)
        e = new Error(err.body);
        e.statusCode = err.statusCode;
        next(e);
    }
});

//ชื่อ collection
const postFoundCatModel = mongoose.model('post_found_cats', postFoundCatSchema);

module.exports = { postFoundCatModel };
