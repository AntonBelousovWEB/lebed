const { model, Schema } = require('mongoose');

const ctxRefSchema = new Schema({
    dataRef: String
});

module.exports = model('ctxRef', ctxRefSchema);