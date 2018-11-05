const mongoose = require('mongoose')

const Schema = mongoose.Schema
const langListSchemat = new Schema({
    langCode: String,
})

module.exports = mongoose.model('langCode', langListSchemat, 'languages_list')