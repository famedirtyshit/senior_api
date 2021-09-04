const mongoose = require(`mongoose`);
const schema = mongoose.Schema;
const geolib = require('geolib');
const { testColModel } = require(`./TestCol`);
const { postLostCatModel } = require(`./PostLostCat`);

const postFoundCatSchema = new schema({
    postType: { type: String, default: 'found' },
    location: { type: { type: String, enum: ['Point'], require: true }, coordinates: { type: [Number], required: true } },
    date: Date,
    sex: String,
    collar: Boolean,
    description: String,
    urls: [{ url: String }],
    owner: { type: schema.Types.ObjectId, ref: 'users' }
})

postFoundCatSchema.index({ location: '2dsphere' })

postFoundCatSchema.methods.checkDistance = (srcLat, srcLng, desLat, desLng) => {
    return geolib.getDistance(
        { latitude: srcLat, longitude: srcLng },
        { latitude: desLat, longitude: desLng }
    );
}

postFoundCatSchema.post('save', function (doc, next) {
    let query = postLostCatModel.find();
    query.where('location').equals({
        $near: {
            $maxDistance: 2000,
            $geometry: {
                type: "Point",
                coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]]
            }
        }
    }).exec().then(res => {
        let lostPostInArea = res.map(post => post._id)
        postLostCatModel.updateMany({ _id: lostPostInArea }, { $push: { nearFoundCat: { _id: mongoose.Types.ObjectId(doc._id) } } }, null, (err, result) => {
            if (err) {
                e = new Error(err.body);
                e.message = err.message;
                e.statusCode = err.statusCode;
                next(e);
                console.log('------------')
                console.log('push array post noti fail')
                console.log(err)
                console.log('------------')
            } else {
                next();
                res.map(lostPost => {
                    let session = sessionMap.get(lostPost.owner.toString());
                    if (session != undefined && session.length > 0) {
                        session.map(item => {
                            io.to(item).emit('newNearPost', { foundPost: doc, lostPost: lostPost })
                        })
                    }
                })
            }
        })
    }).catch(err => {
        console.log('error in middle')
        e = new Error(err.body);
        e.message = err.message;
        e.statusCode = err.statusCode;
        next(e);
    })
})

postFoundCatSchema.post('findOneAndDelete', function (next) {
    // Remove all the assignment docs that reference the removed person.
    console.log('delete post in other')
    // testColModel.deleteMany({ 'post': this._id }, function (err, result) {
    //     if (err) {
    //         e = new Error(err.body);
    //         e.statusCode = err.statusCode;
    //         next(e);
    //     } else {
    //         console.log('success');
    //         next();
    //     }
    // });
    try {
        const queryId = this.getQuery()["_id"];
        testColModel.updateMany({ 'post.postId': queryId }, { $pull: { post: { postId: queryId } } }, null, (err, res) => {
            console.log(res)
            console.log('------------')
            if (err) {
                console.log('------------')
                console.log('delete array post noti fail')
                console.log(err)
                console.log('------------')
            }
        })
        // -----------------------------
        // let allQuery = [];
        // console.log(queryId)
        // testColModel.find({ post: queryId }).exec().then(res => {
        //     console.log(res)
        //     console.log('---------------')
        //     let newPost = [];
        //     res.map(item => {
        //         for(let i = 0; i < item.post.length; i++){
        //             // console.log(item.post[i])
        //             // console.log(queryId)
        //             if(item.post[i].toString() != queryId.toString()){
        //                 newPost.push(item.post[i])
        //                 // console.log('!=')
        //             }
        //         }
        //         item.post = newPost;
        //         newPost = [];
        //         allQuery.push(item.save())
        //     })
        //     // Promise.all(allQuery);
        // }).catch(err => {
        //     console.log('find error')
        //     console.log(err)
        // })
        // ------------------------------
        // let query = testColModel.find();
        // // query.where({ post: '61267dddb0112967b6d85520' })
        // // query.exec().then(res => { console.log(res); next(); }).catch(err => {
        // //     e = new Error(err.body);
        // //     e.statusCode = err.statusCode;
        // //     // next(e);
        // // })
        // ----------------------------------------
    } catch (err) {
        console.log('error in middle')
        console.log(err)
        e = new Error(err.body);
        e.statusCode = err.statusCode;
        // next(e);
    }
});

//ชื่อ collection
const postFoundCatModel = mongoose.model('post_found_cats', postFoundCatSchema);

module.exports = { postFoundCatModel };
