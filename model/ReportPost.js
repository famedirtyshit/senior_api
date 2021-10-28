const mongoose = require(`mongoose`);
const schema = mongoose.Schema;

const reportPostSchema = new schema({
    postId: {type: schema.Types.ObjectId, required: true, refPath: 'onModel'},
    onModel: {type: String, required: true, enum: ['post_found_cats','post_lost_cats'] },
    reason: {type: schema.Types.Mixed}
})
                                //ชื่อ collection
const reportPostModel = mongoose.model('report_posts', reportPostSchema);

module.exports = { reportPostModel };
