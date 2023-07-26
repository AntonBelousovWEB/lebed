const { model, Schema } = require('mongoose');

const ctxRefSchema = new Schema({
    name: String,
    dataRef: String
});

module.exports = model('ctxRef', ctxRefSchema);