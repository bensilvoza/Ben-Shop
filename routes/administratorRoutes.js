
var express = require("express");
var router  = express.Router();
var Product = require("../models/product")

// home
router.get("/administrator", function (req, res){
	res.redirect("/administrator/products")
})

// products
router.get("/administrator/products", async function (req, res){
	var products = await Product.find({})
	res.render("administrator/products", {products: products})
})

// product
router.get("/administrator/product/:id", async function (req, res){
	var product_id = req.params.id;
	var product = await Product.findById(product_id)
	res.render("administrator/product", {product: product})
})

// create new product
router.get("/administrator/create", function (req, res){
	res.render("administrator/create")
})

router.post("/administrator/create", async function (req, res){
	var product = {
		"name": req.body.name,
		"price": req.body.price,
		"quantity": req.body.quantity,
		"photoUrl": req.body.photoUrl,
		"description": req.body.description
	}
	
	var handle_product = new Product({"name": product["name"], "price": product["price"], "quantity": product["quantity"], "photoUrl": product["photoUrl"], "description": product["description"]});                    
	await handle_product.save()
	res.redirect("/administrator")
	
})

// edit product
router.get("/administrator/product/edit/:id", async function (req, res){
	var product_id = req.params.id;
	var product = await Product.findById(product_id)
	res.render("administrator/edit", {product: product})
})

// edit product
router.put("/administrator/product/edit/:id", async function (req, res){
	var product_id = req.params.id;
	var product = {
		"name": req.body.name,
		"price": req.body.price,
		"quantity": req.body.quantity,
		"photoUrl": req.body.photoUrl,
		"description": req.body.description
	}
	var updatedProduct = await Product.findByIdAndUpdate(product_id, product);
	//await updatedProduct.save()
	res.redirect("/administrator")
})

// delete product
router.delete("/administrator/product/delete/:id", async function (req, res){
	var product_id = req.params.id;
	await Product.findByIdAndDelete(product_id);
	res.redirect("/administrator")
})



// exports
module.exports = router;