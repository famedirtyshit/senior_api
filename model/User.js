const mongoose = require(`mongoose`);
const schema = mongoose.Schema;

const userSchema = new schema({
    fbId: { type: String, required: true },
    firstname : { type: String, required: true },
    lastname : { type: String, required: true },
    phone : { type: String, required: true },
    facebook : { type: String },
    instagram : { type: String },
})
                                //ชื่อ collection
const userModel = mongoose.model('users', userSchema);

module.exports = { userModel };
