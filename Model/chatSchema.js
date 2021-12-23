const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messagesSchema = new Schema({
    sender: {type: String},
    message: {type: String}
});

module.exports = mongoose.model('messages', messagesSchema);