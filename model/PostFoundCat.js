const mongoose = require(`mongoose`);
const schema = mongoose.Schema;

const postFoundCatSchema = new schema({
    location: {type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true }},
    date: Date,
    sex: String,
    collar: Boolean,
    description: String,
    urls: [{ url: String }]
})

postFoundCatSchema.index({location: '2dsphere'})

//ชื่อ collection
const postFoundCatModel = mongoose.model('post_found_cat', postFoundCatSchema);

module.exports = { postFoundCatModel };
