const mongoose = require(`mongoose`);

const connectDB = async () => {
   let connection =  await mongoose.connect(process.env.DB_HOST, {
        useNewUrlParser: true
    })
    return connection;
}

module.exports = connectDB;

