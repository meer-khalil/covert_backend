const mongoose = require('mongoose');

mongoose.set('strictQuery', true)

let MONGO_URI = null;
// let MONGO_URI = 'mongodb+srv://khalil:raeela123@cluster0.zd8175o.mongodb.net/realstate?retryWrites=true&w=majority';

if (!MONGO_URI) {
    MONGO_URI = process.env.MONGO_URI
}

const connectDatabase = () => {
    mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Mongoose Connected");
        });
}

module.exports = connectDatabase;