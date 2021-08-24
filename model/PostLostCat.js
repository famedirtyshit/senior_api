// const mongoose = require(`mongoose`);
// const schema = mongoose.Schema;
// const {checkGeolocation} = require("./util/geolocation");

// const postLostCatSchema = new schema({
//     postType: { type: String, default: 'lost' },
//     location: {type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true }},
//     date : Date,
//     sex : String,
//     collar : Boolean,
//     description : String,
//     urls : [{url : String}]
// })

// postLostCatSchema.index({location: '2dsphere'})

// postLostCatSchema.methods.checkDistance = checkGeolocation;

//                                 //ชื่อ collection
// const postLostCatModel = mongoose.model('post_lost_cat', postLostCatSchema);

// module.exports = { postLostCatModel };
