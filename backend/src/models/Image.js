// models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    contentType: String,
    name: String,
    data: String, // Store the Base64 string
});

module.exports = mongoose.model('Image', imageSchema);