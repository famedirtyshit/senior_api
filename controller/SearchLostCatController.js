const { postLostCatModel } = require(`../model/PostLostCat`);
const connectDB = require(`../config/ConnectDB`);


const searchLostCat = async (req, res, next) => {
        try {
                connectDB();
                if (!req.params.lat || !req.params.lng || !req.params.radius) {
                        res.status(400).json({ result: false, msg: 'please input data correctly' })
                }
                let countFilter = {};
                let query = postLostCatModel.find({date:{$gte:req.params.from,$lte:req.params.to}}).populate('owner');
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
                const [result, count] = await Promise.all([
                        query.exec(),
                        postLostCatModel.count(countFilter)
                ])
                res.status(200).json({ result: true, msg: `search success`, searchResult: result, count: count });
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}

const searchLostCatNoMap = async (req, res, next) => {
        try {
                connectDB();
                let countFilter = {};
                let query = postLostCatModel.find({date:{$gte:req.params.from,$lte:req.params.to}}).populate('owner');
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
                query.sort({date: 'desc'})
                countFilter["date"] = { $gte: req.params.from, $lte: req.params.to };
                const [result, count] = await Promise.all([
                        query.exec(),
                        postLostCatModel.count(countFilter)
                ])
                res.status(200).json({ result: true, msg: `search success`, searchResult: result, count: count });
        } catch (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
        }
}



module.exports = { searchLostCat, searchLostCatNoMap };