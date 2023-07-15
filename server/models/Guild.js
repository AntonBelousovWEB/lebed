const { model, Schema } = require('mongoose');

const guildSchema = new Schema({
    name: String,
    ownerId: String,
    membersId: [],
    level: Number,
});

module.exports = model('Guild', guildSchema);