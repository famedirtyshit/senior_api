const { postFoundCatModel } = require(`../model/PostFoundCat`);
const { postLostCatModel } = require(`../model/PostLostCat`);
const connectDB = require(`../config/ConnectDB`);
const { sortByGeo, sortByDate } = require(`../model/util/Geolocation`);

const searchAll = async (req, res, next) => {
    try {
        connectDB();
        if (!req.params.lat || !req.params.lng || !req.params.radius) {
            res.status(400).json({ result: false, msg: 'please input data correctly' })
        }
        let queryFound = postFoundCatModel.find();
        let queryLost = postLostCatModel.find();
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
            queryFound.where('sex').equals(sexQuery)
            queryLost.where('sex').equals(sexQuery)
        }
        let collarQuery = [];
        if (req.params.haveCollar != 'false') {
            collarQuery.push(true)
        }
        if (req.params.notHaveCollar != 'false') {
            collarQuery.push(false)
        }
        if (collarQuery.length > 0) {
            queryFound.where('collar').equals(collarQuery)
            queryLost.where('collar').equals(collarQuery)
        }
        queryFound.where('location').equals({
            $near: {
                $maxDistance: req.params.radius * 1000,
                $geometry: {
                    type: "Point",
                    coordinates: [req.params.lng, req.params.lat]
                }
            }
        })
        queryLost.where('location').equals({
            $near: {
                $maxDistance: req.params.radius * 1000,
                $geometry: {
                    type: "Point",
                    coordinates: [req.params.lng, req.params.lat]
                }
            }
        })
        const [lostResult, foundResult] = await Promise.all([
            queryLost.exec(),
            queryFound.exec()
        ])
        let result = [];
        for (let i = 0; i < lostResult.length; i++) {
            let postObj = { distance: null, post: lostResult[i] };
            postObj.distance = lostResult[i].checkDistance(req.params.lat, req.params.lng, lostResult[i].location.coordinates[1], lostResult[i].location.coordinates[0]);
            result.push(postObj);
        }
        for (let i = 0; i < foundResult.length; i++) {
            let postObj = { distance: null, post: foundResult[i] };
            postObj.distance = foundResult[i].checkDistance(req.params.lat, req.params.lng, foundResult[i].location.coordinates[1], foundResult[i].location.coordinates[0]);
            result.push(postObj);
        }
        let maxPerPage = parseInt(process.env.MAXPERPAGE);
        if (req.params.sortType == 'latest') {
            result.sort(sortByDate);
        } else {
            result.sort(sortByGeo);
        }
        let pageResult = result.slice(maxPerPage * (req.params.page - 1), (maxPerPage * (req.params.page - 1)) + maxPerPage);
        res.json({ result: true, msg: `search success`, searchResult: pageResult, count: result.length });
    } catch (err) {
        console.log(err.message)
        e = new Error(err.body);
        e.statusCode = err.statusCode;
        next(e);
    }
}

const searchAllNoMap = async (req, res, next) => {
    try {
        connectDB();
        let queryFound = postFoundCatModel.find();
        let queryLost = postLostCatModel.find();
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
            queryFound.where('sex').equals(sexQuery)
            queryLost.where('sex').equals(sexQuery)
        }
        let collarQuery = [];
        if (req.params.haveCollar != 'false') {
            collarQuery.push(true)
        }
        if (req.params.notHaveCollar != 'false') {
            collarQuery.push(false)
        }
        if (collarQuery.length > 0) {
            queryFound.where('collar').equals(collarQuery)
            queryLost.where('collar').equals(collarQuery)
        }
        const [lostResult, foundResult] = await Promise.all([
            queryLost.exec(),
            queryFound.exec()
        ])
        let result = [];
        for (let i = 0; i < lostResult.length; i++) {
            result.push(lostResult[i]);
        }
        for (let i = 0; i < foundResult.length; i++) {
            result.push(foundResult[i]);
        }
        let maxPerPage = parseInt(process.env.MAXPERPAGE);
        result.sort(sortByDate);
        let pageResult = result.slice(maxPerPage * (req.params.page - 1), (maxPerPage * (req.params.page - 1)) + maxPerPage);
        res.json({ result: true, msg: `search success`, searchResult: pageResult, count: result.length });
    } catch (err) {
        console.log(err.message)
        e = new Error(err.body);
        e.statusCode = err.statusCode;
        next(e);
    }
}





module.exports = { searchAll, searchAllNoMap };