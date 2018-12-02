const mongoose = require('mongoose')

const Schema = mongoose.Schema
const navbarSchemat = new Schema({
    prefix: String,
    navBarItem: String,
    navBarItemLabel: String,
})

module.exports = mongoose.model('navbar', navbarSchemat, 'navbar')