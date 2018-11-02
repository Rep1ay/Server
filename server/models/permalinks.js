const mongoose = require('mongoose')

const Schema = mongoose.Schema
const permalinkSchema = new Schema({
    pageTitle: String,
    permalink: String
})

module.exports = mongoose.model('permalink', permalinkSchema, 'permalinks')