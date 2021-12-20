const mongoose = require('mongoose');
require('dotenv').config();
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PW = process.env.MONGO_PW;
const MONGO_DB = process.env.MONGO_DB;

const MONGOURI = `mongodb+srv://${MONGO_USER}:${MONGO_PW}@${MONGO_DB}.mongodb.net/${MONGO_DB}?`;

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, {
            useNewUrlParser: true
        });
        console.log("Connected to db !!");
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = InitiateMongoServer