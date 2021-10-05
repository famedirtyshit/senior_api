const mongoose = require(`mongoose`);
const schema = mongoose.Schema;
const geolib = require('geolib');

const postLostCatSchema = new schema({
    postType: { type: String, default: 'lost' },
    location: { type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true } },
    date: Date,
    sex: String,
    collar: Boolean,
    description: String,
    urls: [{ url: String, fileName: String }],
    owner: { type: schema.Types.ObjectId, ref: 'users' },
    nearFoundCat: [{ status: { type: Boolean, default: true }, _id: { type: schema.Types.ObjectId, ref: 'post_found_cats' } }]
}, { timestamps: true })

postLostCatSchema.index({ location: '2dsphere' })
postLostCatSchema.index({ expires:1 }, { expireAfterSeconds: 0 });

postLostCatSchema.methods.checkDistance = (srcLat, srcLng, desLat, desLng) => {
    return geolib.getDistance(
        { latitude: srcLat, longitude: srcLng },
        { latitude: desLat, longitude: desLng }
    );
}

//ชื่อ collection
const postLostCatModel = mongoose.model('post_lost_cats', postLostCatSchema);

module.exports = { postLostCatModel };
