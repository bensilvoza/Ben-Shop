

var mongoose = require("mongoose");

// Order
var orderSchema = new mongoose.Schema({customer_name: String, id: Number, address: {}, order: [], partial_total: Number, tax: Number, total: Number });          
var Order = mongoose.model('Order', orderSchema);

module.exports = Order;