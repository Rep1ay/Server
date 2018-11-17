const mongoose = require('mongoose')

const Schema = mongoose.Schema
const newsSchemat = new Schema({
    id: String,
    image: String,
    prefix: String,
    category: String,
    title: String,
    description: String,
    date: String,
    template: String
})

module.exports = mongoose.model('news_collection', newsSchemat, 'news')