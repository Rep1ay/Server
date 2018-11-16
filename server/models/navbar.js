const mongoose = require('mongoose')

const Schema = mongoose.Schema
const navbarSchemat = new Schema({
    promoCode: String,
})

module.exports = mongoose.model('navbar', navbarSchemat, 'navbar')