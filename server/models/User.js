const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    name: String,
    password: String,
    tokenJWT: String,
    color: String,
    guild: String,
    level: Number
});

module.exports = model('User', userSchema);