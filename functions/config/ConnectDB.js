const mongoose = require(`mongoose`);

const connectDB = () => {
    mongoose.connect(process.env.DB_HOST, {
        useNewUrlParser: true
    })
}

module.exports = connectDB;

