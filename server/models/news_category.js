const mongoose = require('mongoose')

const Schema = mongoose.Schema
const newsCategorySchemat = new Schema({
    category: String,
    prefix: String,
})

module.exports = mongoose.model('news_category', newsCategorySchemat, 'news_category')