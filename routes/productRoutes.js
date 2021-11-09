
var express = require("express");
var router  = express.Router();
var Product = require("../models/product")

// landing
router.get("/", function (req, res){
	res.redirect("/products")
})

// show all products
router.get("/products", async function (req, res){
	var products = await Product.find({})
	res.render("products/products", {products: products})
})

// show single product
router.get("/product/:id", async function (req, res){
	var product_id = req.params.id
	var product = await Product.findById(product_id)
	res.render("products/product", {product: product})
})



// exports
module.exports = router;