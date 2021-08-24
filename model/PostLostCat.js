const mongoose = require(`mongoose`);
const schema = mongoose.Schema;

const postLostCatSchema = new schema({
    location: {type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true }},
    date : Date,
    sex : String,
    collar : Boolean,
    description : String,
    urls : [{url : String}]
})

postLostCatSchema.index({location: '2dsphere'})
                                //ชื่อ collection
const postLostCatModel = mongoose.model('post_lost_cat', postLostCatSchema);

module.exports = { postLostCatModel };
