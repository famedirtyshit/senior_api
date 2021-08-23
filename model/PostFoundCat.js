const mongoose = require(`mongoose`);
const schema = mongoose.Schema;

const postFoundCatSchema = new schema({
    lat:Number,
    lng:Number,
    date : Date,
    sex : Boolean,
    collar : Boolean,
    description : String,
    urls : [{url : String}]
})

                                //ชื่อ collection
const postFoundCatModel = mongoose.model('post_found_cat', postFoundCatSchema);

module.exports = { postFoundCatModel };
