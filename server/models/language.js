const mongoose = require('mongoose')

const Schema = mongoose.Schema
const languageSchema = new Schema({
    prefix: String
})

module.exports = mongoose.model('language', languageSchema, 'languages')