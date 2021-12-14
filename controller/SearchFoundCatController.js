const { postFoundCatModel } = require(`../model/PostFoundCat`);
const { postLostCatModel } = require(`../model/PostLostCat`);
const connectDB = require(`../config/ConnectDB`);
const mongoose = require(`mongoose`);

const searchFoundCat = async (req, res, next) => {
        try {
                connectDB();
                if (!req.params.lat || !req.params.lng || !req.params.radius) {
                        res.status(400).json({ result: false, msg: 'please input data correctly' })
                }
                let countFilter = {};
                let query = postFoundCatModel.find({ date: { $gte: req.params.from, $lte: req.params.to } }).populate('owner');
                let sexQuery = [];
                if (req.params.male != 'false') {
                        sexQuery.push('true');
                }
                if (req.params.female != 'false') {
                        sexQuery.push('false');
                }
                if (req.params.unknow != 'false') {
                        sexQuery.push('unknow')
                }
                if (sexQuery.length > 0) {
                        query.where('sex').equals(sexQuery)
                        countFilter["sex"] = sexQuery;
                }
                let collarQuery = [];
                if (req.params.haveCollar != 'false') {
                        collarQuery.push(true)
                }
                if (req.params.notHaveCollar != 'false') {
                        collarQuery.push(false)
                }
                if (collarQuery.length > 0) {
                        query.where('collar').equals(collarQuery)
                        countFilter["collar"] = collarQuery;
                }
                query.where('status').equals('active');
                let maxPerPage = 12;
                query.skip(maxPerPage * (req.params.page - 1)).limit(maxPerPage);
                if (req.params.sortType == 'latest') {
                        query.sort({ date: 'desc' })
                }
                query.where('location').equals({
                        $near: {
                                $maxDistance: req.params.radius * 1000,
                                $geometry: {
                                        type: "Point",
                                        coordinates: [req.params.lng, req.params.lat]
                                }
                        }
                })
                countFilter["location"] = {
                        $near: {
                                $maxDistance: req.params.radius * 1000,
                                $geometry: {
                                        type: "Point",
                                        coordinates: [req.params.lng, req.params.lat]
                                }
                        }
                }
                countFilter["date"] = { $gte: req.params.from, $lte: req.params.to };
                countFilter["status"] = 'active';
                const [result, count] = await Promise.all([
                        query.exec(),
                        postFoundCatModel.count(countFilter)
                ])
                res.status(200).json({ result: true, msg: `search success`, searchResult: result, count: count });
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const searchFoundCatNoMap = async (req, res, next) => {
        try {
                connectDB();
                let countFilter = {};
                let query = postFoundCatModel.find({ date: { $gte: req.params.from, $lte: req.params.to } }).populate('owner');
                let sexQuery = [];
                if (req.params.male != 'false') {
                        sexQuery.push('true');
                }
                if (req.params.female != 'false') {
                        sexQuery.push('false');
                }
                if (req.params.unknow != 'false') {
                        sexQuery.push('unknow')
                }
                if (sexQuery.length > 0) {
                        query.where('sex').equals(sexQuery)
                        countFilter["sex"] = sexQuery;
                }
                let collarQuery = [];
                if (req.params.haveCollar != 'false') {
                        collarQuery.push(true)
                }
                if (req.params.notHaveCollar != 'false') {
                        collarQuery.push(false)
                }
                if (collarQuery.length > 0) {
                        query.where('collar').equals(collarQuery)
                        countFilter["collar"] = collarQuery;
                }
                query.where('status').equals('active');
                countFilter["status"] = 'active';
                let maxPerPage = 12;
                query.skip(maxPerPage * (req.params.page - 1)).limit(maxPerPage);
                query.sort({ date: 'desc' })
                countFilter["date"] = { $gte: req.params.from, $lte: req.params.to };
                const [result, count] = await Promise.all([
                        query.exec(),
                        postFoundCatModel.count(countFilter)
                ])
                res.status(200).json({ result: true, msg: `search success`, searchResult: result, count: count });
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const searchNearFoundPostFromLostPost = async (req, res, next) => {
        try {
                connectDB();
                if (!req.params.lostPostId) {
                        res.status(400).json({ result: false, message: 'bad request error', searchResult: null });
                }
                let lostPost = await postLostCatModel.findById({ _id: req.params.lostPostId }).populate('nearFoundCat._id').exec();
                res.status(200).json({ result: true, searchResult: lostPost });
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const checkNearFoundCatPost = async (req, res, next) => {
        try {
                connectDB();
                if (!req.params.foundPostId || !req.params.lostPostId) {
                        res.status(400).json({ result: false, message: 'bad request error', searchResult: null });
                }
                postLostCatModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.lostPostId) }, { $set: { "nearFoundCat.$[element].status": false } }, {
                        upsert: true,
                        arrayFilters: [{ "element._id": mongoose.Types.ObjectId(req.params.foundPostId) }]
                }, async (err, result) => {
                        if (err) {
                                e = new Error(err.body);
                                e.message = err.message;
                                e.statusCode = err.statusCode;
                                next(e);
                        } else {
                                let foundPostRef = null;
                                result.nearFoundCat.map((item) => {
                                        if (item._id.toString() == req.params.foundPostId.toString()) {
                                                foundPostRef = item;
                                                return;
                                        }
                                })
                                if (foundPostRef == null) {
                                        res.status(200).json({ result: true, updateResult: foundPostRef })
                                } else {
                                        let foundPostDetail = await postFoundCatModel.findById({ _id: mongoose.Types.ObjectId(foundPostRef._id) }).populate('owner').exec();
                                        res.status(200).json({ result: true, updateResult: foundPostDetail });
                                }
                        }
                })
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

module.exports = { searchFoundCat, searchFoundCatNoMap, searchNearFoundPostFromLostPost, checkNearFoundCatPost };