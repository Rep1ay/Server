const mongoose = require('mongoose')

const Schema = mongoose.Schema
const templateSchema = new Schema({
    prefix: String,
    pageTitle: String,
    template: String
})

module.exports = mongoose.model('template', templateSchema, 'templates')