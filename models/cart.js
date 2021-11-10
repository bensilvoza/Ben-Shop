
var mongoose = require("mongoose");

// Cart
var cartSchema = new mongoose.Schema({customer_name: String, cart: [] });     
var Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;