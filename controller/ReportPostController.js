const { reportPostModel } = require(`../model/ReportPost`);
const { postFoundCatModel } = require(`../model/PostFoundCat`);
const { postLostCatModel } = require(`../model/PostLostCat`);
const connectDB = require(`../config/ConnectDB`);
const mongoose = require(`mongoose`);

const report = async (req, res, next) => {
    try {
        connectDB();
        const payload = req.body;
        if (!payload.postId || !payload.reason || !payload.type) {
            res.status(400).json({ result: false, msg: 'please input correct data' })
        } else {
            if (payload.type == 'lost') {
                let queryLost = await postLostCatModel.findById({ _id: payload.postId }).exec();
                if (!queryLost) {
                    res.status(200).json({ result: false, msg: 'post not exist' })
                } else {
                    if (queryLost.status != 'active') {
                        res.status(200).json({ result: false, msg: 'can\'t report none active post' })
                    } else {
                        let reportPostTarget = await reportPostModel.findOne({ postId: payload.postId }).exec();
                        if (reportPostTarget) {
                            if (reportPostTarget.reason[payload.reason]) {
                                let newReasonObj = reportPostTarget.reason;
                                newReasonObj[payload.reason] = reportPostTarget.reason[payload.reason] + 1;
                                let updateRes = await reportPostModel.findByIdAndUpdate(mongoose.Types.ObjectId(reportPostTarget._id), { reason: newReasonObj }, { new: true }).exec();
                                if (updateRes == null) {
                                    res.status(500).json({ result: false, msg: 'post not exist', updateResult: updateRes })
                                } else {
                                    res.status(200).json({ result: true, msg: 'report successful', updateResult: updateRes })
                                }
                            } else {
                                let newReasonObj = reportPostTarget.reason;
                                newReasonObj[payload.reason] = 1;
                                let updateRes = await reportPostModel.findByIdAndUpdate(mongoose.Types.ObjectId(reportPostTarget._id), { reason: newReasonObj }, { new: true }).exec();
                                if (updateRes == null) {
                                    res.status(500).json({ result: false, msg: 'post not exist', updateResult: updateRes })
                                } else {
                                    res.status(200).json({ result: true, msg: 'report successful', updateResult: updateRes })
                                }
                            }
                        } else {
                            let modelTarget = payload.type == 'lost' ? 'post_lost_cats' : 'post_found_cats';
                            let reasonObj = {};
                            reasonObj[payload.reason] = 1;
                            const newReportPost = await reportPostModel.create({
                                postId: mongoose.Types.ObjectId(payload.postId),
                                onModel: modelTarget,
                                reason: reasonObj
                            });
                            res.status(200).json({ result: true, msg: 'report successful', postResult: newReportPost });
                        }
                    }
                }
            } else if (payload.type == 'found') {
                let queryFound = await postFoundCatModel.findById({ _id: payload.postId }).exec();
                if (!queryFound) {
                    res.status(200).json({ result: false, msg: 'post not exist' })
                } else {
                    if (queryFound.status != 'active') {
                        res.status(200).json({ result: false, msg: 'can\'t report none active post' })
                    } else {
                        let reportPostTarget = await reportPostModel.findOne({ postId: payload.postId }).exec();
                        if (reportPostTarget) {
                            if (reportPostTarget.reason[payload.reason]) {
                                let newReasonObj = reportPostTarget.reason;
                                newReasonObj[payload.reason] = reportPostTarget.reason[payload.reason] + 1;
                                let updateRes = await reportPostModel.findByIdAndUpdate(mongoose.Types.ObjectId(reportPostTarget._id), { reason: newReasonObj }, { new: true }).exec();
                                if (updateRes == null) {
                                    res.status(500).json({ result: false, msg: 'post not exist', updateResult: updateRes })
                                } else {
                                    res.status(200).json({ result: true, msg: 'report successful', updateResult: updateRes })
                                }
                            } else {
                                let newReasonObj = reportPostTarget.reason;
                                newReasonObj[payload.reason] = 1;
                                let updateRes = await reportPostModel.findByIdAndUpdate(mongoose.Types.ObjectId(reportPostTarget._id), { reason: newReasonObj }, { new: true }).exec();
                                if (updateRes == null) {
                                    res.status(500).json({ result: false, msg: 'post not exist', updateResult: updateRes })
                                } else {
                                    res.status(200).json({ result: true, msg: 'report successful', updateResult: updateRes })
                                }
                            }
                        } else {
                            let modelTarget = payload.type == 'lost' ? 'post_lost_cats' : 'post_found_cats';
                            let reasonObj = {};
                            reasonObj[payload.reason] = 1;
                            const newReportPost = await reportPostModel.create({
                                postId: mongoose.Types.ObjectId(payload.postId),
                                onModel: modelTarget,
                                reason: reasonObj
                            });
                            res.status(200).json({ result: true, msg: 'report successful', postResult: newReportPost });
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.log(err.message)
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

module.exports = { report }