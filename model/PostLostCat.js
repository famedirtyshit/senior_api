const mongoose = require(`mongoose`);
const schema = mongoose.Schema;
const geolib = require('geolib');

const postLostCatSchema = new schema({
    postType: { type: String, default: 'lost' },
    location: {type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true }},
    date : Date,
    sex : String,
    collar : Boolean,
    description : String,
    urls : [{url : String}],
    owner: { type: schema.Types.ObjectId, ref: 'users' },
    nearFoundCat: [{ status: { type: Boolean, default: true }, postId: { type: schema.Types.ObjectId } }]
})

postLostCatSchema.index({location: '2dsphere'})

postLostCatSchema.methods.checkDistance = (srcLat, srcLng, desLat, desLng) => {
    return geolib.getDistance(
        { latitude: srcLat, longitude: srcLng },
        { latitude: desLat, longitude: desLng }
    );
}

                                //ชื่อ collection
const postLostCatModel = mongoose.model('post_lost_cat', postLostCatSchema);

module.exports = { postLostCatModel };
