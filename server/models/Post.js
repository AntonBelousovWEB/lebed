const { model, Schema } = require('mongoose');

const postSchema = new Schema({
    title: String,
    desc: String,
    img: String,
    link: String
});

module.exports = model('Post', postSchema);