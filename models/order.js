

var mongoose = require("mongoose");

// Order
var orderSchema = new mongoose.Schema({customer_name: String, id: Number, address: {}, order: [], partial_total: Number, tax:Number, total:Number, payment_method:String });          
var Order = mongoose.model('Order', orderSchema);

module.exports = Order;