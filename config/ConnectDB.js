const mongoose = require(`mongoose`);

const connectDB = async () => {
    await mongoose.connect(process.env.DB_HOST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
}

module.exports = connectDB;

