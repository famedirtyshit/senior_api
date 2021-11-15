const { userModel } = require(`../model/User`);
const { reportPostModel } = require(`../model/ReportPost`);
const connectDB = require(`../config/ConnectDB`);
const mongoose = require(`mongoose`);
const { postFoundCatModel } = require(`../model/PostFoundCat`);
const { postLostCatModel } = require(`../model/PostLostCat`);
let dayjs = require('dayjs');

const checkAdmin = async (req, res, next) => {
    try {
        connectDB();
        if (!req.params.id) {
            res.status(400).json({ result: false, message: 'bad request error' })
            return;
        }
        userModel.find({ fbId: req.params.id }).exec().then(response => {
            if (response.length < 1) {
                res.status(200).json({ result: false, searchResult: [], message: 'user not found' })
            } else {
                if (response[0].role == 'admin') {
                    res.status(200).json({ result: true, searchResult: response });
                } else {
                    res.status(200).json({ result: false, searchResult: [], message: 'user not found' })
                }
            }
        }).catch(err => {
            e = new Error(err.body);
            e.message = err.message;
            e.statusCode = err.statusCode;
            next(e);
        })
    } catch (err) {
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

const getReportPost = async (req, res, next) => {
    try {
        connectDB();
        if (!req.params.id) {
            res.status(400).json({ result: false, message: 'bad request error' })
            return;
        }
        userModel.find({ fbId: req.params.id }).exec().then(async (response) => {
            if (response.length < 1) {
                res.status(200).json({ result: false, searchResult: [], message: 'user not found' })
            } else {
                if (response[0].role == 'admin') {
                    let query = reportPostModel.find().populate('postId');
                    let result = await query.exec();
                    res.status(200).json({ result: true, searchResult: result });
                } else {
                    res.status(200).json({ result: false, searchResult: [], message: 'user not found' })
                }
            }
        }).catch(err => {
            e = new Error(err.body);
            e.message = err.message;
            e.statusCode = err.statusCode;
            next(e);
        })
    } catch (err) {
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

const rejectReportPost = async (req, res, next) => {
    try {
        connectDB();
        const payload = req.body;
        if (!payload.postId || !payload.fbId) {
            res.status(400).json({ result: false, message: 'bad request' });
        } else {
            userModel.find({ fbId: payload.fbId }).exec().then(async (response) => {
                if (response.length < 1) {
                    res.status(200).json({ result: false, searchResult: [], message: 'user not found' })
                } else {
                    if (response[0].role == 'admin') {
                        let result = await reportPostModel.findOneAndDelete({ postId: mongoose.Types.ObjectId(payload.postId) }).exec();
                        if (result) {
                            res.status(200).json({ result: true, message: 'reject success' });
                        } else {
                            res.status(200).json({ result: true, message: 'this report is non existing or this port is unpublish' });
                        }
                    } else {
                        res.status(200).json({ result: false, message: 'you don\'t have access' })
                    }
                }
            }).catch(err => {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
            })
        }
    } catch (err) {
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    }
}

const deleteReportPost = async (req, res, next) => {
    try {
        connectDB();
        const payload = req.body;
        if (!payload.postId || !payload.fbId) {
            res.status(400).json({ result: false, message: 'bad request' });
        } else {
            userModel.find({ fbId: payload.fbId }).exec().then(async (response) => {
                if (response.length < 1) {
                    res.status(200).json({ result: false, searchResult: [], message: 'user not found' })
                } else {
                    if (response[0].role == 'admin') {
                        let reportPostTarget = await reportPostModel.findOne({ postId: mongoose.Types.ObjectId(payload.postId) }).exec();
                        if (reportPostTarget) {
                            if (reportPostTarget.onModel == 'post_found_cats') {
                                let postTarget = await postFoundCatModel.findOne({ _id: mongoose.Types.ObjectId(payload.postId) }).exec();
                                if (postTarget.status == 'active' || postTarget.status == 'inactive') {
                                    let expireDueDate = dayjs(new Date()).add(2592000, 'second').toDate();
                                    let postTargetDelete = await postFoundCatModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(payload.postId) }, { $set: { status: 'deleteByAdmin', expires: expireDueDate } }).exec();
                                    let reportDelete = await reportPostModel.findOneAndDelete({ postId: mongoose.Types.ObjectId(payload.postId) }).exec();
                                    res.status(200).json({ result: true, message: 'delete post success' });
                                } else {
                                    let result = await reportPostModel.findOneAndDelete({ postId: mongoose.Types.ObjectId(payload.postId) }).exec();
                                    res.status(200).json({ result: true, message: 'this port is already unpublish' });
                                }
                            } else {
                                let postTarget = await postLostCatModel.findOne({ _id: mongoose.Types.ObjectId(payload.postId) }).exec();
                                if (postTarget.status == 'active' || postTarget.status == 'inactive') {
                                    let expireDueDate = dayjs(new Date()).add(2592000, 'second').toDate();
                                    let postTargetDelete = await postLostCatModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(payload.postId) }, { $set: { status: 'deleteByAdmin', expires: expireDueDate } }).exec();
                                    let reportDelete = await reportPostModel.findOneAndDelete({ postId: mongoose.Types.ObjectId(payload.postId) }).exec();
                                    res.status(200).json({ result: true, message: 'delete post success' });
                                } else {
                                    let result = await reportPostModel.findOneAndDelete({ postId: mongoose.Types.ObjectId(payload.postId) }).exec();
                                    res.status(200).json({ result: true, message: 'this port is already unpublish' });
                                }
                            }
                        } else {
                            res.status(200).json({ result: true, message: 'this report is non existing or this port is unpublish' });
                        }
                    } else {
                        res.status(200).json({ result: false, message: 'you don\'t have access' })
                    }
                }
            }).catch(err => {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
            })
        }
    } catch (err) {
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
    }
}

module.exports = { checkAdmin, getReportPost, rejectReportPost, deleteReportPost };