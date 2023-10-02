const { model, Schema } = require('mongoose');

const messageSchema = new Schema({
    color: String,
    message: String
});

module.exports = model('Message', messageSchema);