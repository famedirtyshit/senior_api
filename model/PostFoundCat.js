const mongoose = require(`mongoose`);
const schema = mongoose.Schema;
const geolib = require('geolib');

const postFoundCatSchema = new schema({
    postType: { type: String, default: 'found' },
    location: {type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true }},
    date: Date,
    sex: String,
    collar: Boolean,
    description: String,
    urls: [{ url: String }]
})

postFoundCatSchema.index({location: '2dsphere'})

postFoundCatSchema.methods.checkDistance = (srcLat, srcLng, desLat, desLng) => {
    return geolib.getDistance(
        { latitude: srcLat, longitude: srcLng },
        { latitude: desLat, longitude: desLng }
    );
}

//ชื่อ collection
const postFoundCatModel = mongoose.model('post_found_cat', postFoundCatSchema);

module.exports = { postFoundCatModel };
