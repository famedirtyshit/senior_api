const { postFoundCatModel } = require(`../model/PostFoundCat`);
const connectDB = require(`../config/ConnectDB`);


const searchFoundCat = (req, res) => {
        try {
                connectDB();
                let searchResult;
                let query = postFoundCatModel.find()
                if(req.params.district){
                        query.where('district').equals(req.params.district)
                }else{
                        res.status(400).json({result:false, msg :'please input data correctly'})
                }
                if(req.params.sex!='null'){
                        query.where('sex').equals(req.params.sex)
                }
                if(req.params.collar!='null'){
                        query.where('collar').equals(req.params.collar)
                }
                query.exec()
                        .then(response => {
                                searchResult = response
                                res.status(200).json({ result: true, msg: `search success`, searchResult });
                        })
                        .catch(err => {
                                res.status(500).json({ result: false, msg: 'search fail ' + err.message });
                        });

        } catch (e) {
                res.status(500).json({ result: false, msg: `some error has occur` });
        }
}



module.exports = { searchFoundCat };