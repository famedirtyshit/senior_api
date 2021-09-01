const mongoose = require(`mongoose`);
const schema = mongoose.Schema;

const testColSchema = new schema({
    name: { type: String, default: 'namena' },
    post: [{ status: { type: Boolean, default: true }, postId: { type: schema.Types.ObjectId } }],
})

//ชื่อ collection
const testColModel = mongoose.model('test_cols', testColSchema);

module.exports = { testColModel };
