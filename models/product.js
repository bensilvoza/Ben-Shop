
var mongoose = require("mongoose");

// User
var productSchema = new mongoose.Schema({ name: String, price: Number, quantity: Number, photoUrl: String, description: String, reviews: [] });     
var Product = mongoose.model('Product', productSchema);

module.exports = Product;