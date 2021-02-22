const { postLostCatModel } = require(`../model/PostLostCat`);
const connectDB = require(`../config/ConnectDB`);


const postLostCat = (req, res) => {
        try {
                connectDB();
                const payload = req.body
                if (payload.district && payload.date && payload.sex && payload.collar && payload.description || payload.sex==false || payload.collar==false) {
                        const newPostLostCat = new postLostCatModel({
                                district: payload.district,
                                date: payload.date,
                                sex: payload.sex,
                                collar: payload.collar,
                                description: payload.description
                        });
                        newPostLostCat.save()
                                .then(response => {
                                        res.status(201).json({ result: true, msg: response })
                                })
                                .catch(err => {
                                        res.status(500).json({ result: false, msg: 'search fail ' + err.message });
                                })
                } else {
                        res.status(400).json({ result: false, msg: 'please input correct data' })
                }
        } catch (e) {
                res.status(500).json({ result: false, msg: `some error has occur` })
        }
}





module.exports = { postLostCat };