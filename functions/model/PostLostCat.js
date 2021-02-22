const mongoose = require(`mongoose`);
const schema = mongoose.Schema;

const postLostCatSchema = new schema({
    district : String,
    date : Date,
    sex : Boolean,
    collar : Boolean,
    description : String
})

                                //ชื่อ collection
const postLostCatModel = mongoose.model('post_lost_cat', postLostCatSchema);

module.exports = { postLostCatModel };
