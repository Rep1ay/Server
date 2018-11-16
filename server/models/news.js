const mongoose = require('mongoose')

const Schema = mongoose.Schema
const newsSchemat = new Schema({
    id: String,
    image: String,
    prefix: String,
    category: String,
    title: String,
    discription: String,
    date: String,
})

module.exports = mongoose.model('news_collection', newsSchemat, 'news')