const mongoose = require('mongoose')

const Schema = mongoose.Schema
const discountSchemat = new Schema({
    promoCode: String,
})

module.exports = mongoose.model('discount', discountSchemat, 'discounts')