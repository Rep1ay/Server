const mongoose = require('mongoose')

const Schema = mongoose.Schema
const articlesSchemat = new Schema({
    id: String,
    image: String,
    category: String,
    title: String,
    prefix: String,
    discription: String,
    date: String,
    template: String
})

module.exports = mongoose.model('articles', articlesSchemat, 'articles')