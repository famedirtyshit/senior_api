const mongoose = require(`mongoose`);
const schema = mongoose.Schema;
const geolib = require('geolib');
const { testColModel } = require(`./TestCol`);
const { postLostCatModel } = require(`./PostLostCat`);

const postFoundCatSchema = new schema({
    postType: { type: String, default: 'found' },
    location: { type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true } },
    date: Date,
    sex: String,
    collar: Boolean,
    description: String,
    urls: [{ url: String, fileName: String }],
    owner: { type: schema.Types.ObjectId, ref: 'users' }
})

postFoundCatSchema.index({ location: '2dsphere' })

postFoundCatSchema.methods.checkDistance = (srcLat, srcLng, desLat, desLng) => {
    return geolib.getDistance(
        { latitude: srcLat, longitude: srcLng },
        { latitude: desLat, longitude: desLng }
    );
}

postFoundCatSchema.post('save', function (doc, next) {
    let query = postLostCatModel.find();
    query.where('location').equals({
        $near: {
            $maxDistance: 2000,
            $geometry: {
                type: "Point",
                coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]]
            }
        }
    }).exec().then(res => {
        let lostPostInArea = res.map(post => post._id)
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
                res.map(lostPost => {
                    let session = sessionMap.get(lostPost.owner.toString());
                    if (session != undefined && session.length > 0) {
                        session.map(item => {
                            io.to(item).emit('newNearPost', { foundPost: doc, lostPost: lostPost })
                        })
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

postFoundCatSchema.post('findOneAndDelete', function (next) {
    try {
        const queryId = this.getQuery()["_id"];
        postLostCatModel.updateMany({ 'nearFoundCat._id': queryId }, { $pull: { nearFoundCat: { _id: queryId } } }, null, (err, res) => {
            if (err) {
                console.log(err)
                e = new Error(err.body);
                e.statusCode = err.statusCode;
                next(e);
            }
        })
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
