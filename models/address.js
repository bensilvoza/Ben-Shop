

var mongoose = require("mongoose");

// Address
var addressSchema = new mongoose.Schema({customer_name: String, street: String, city: String, postal_code: String, country: String });         
var Address = mongoose.model('Address', addressSchema);

module.exports = Address;