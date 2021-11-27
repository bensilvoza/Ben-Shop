
var express = require("express")
var router  = express.Router()
var Product = require("../models/product")

// home
router.get("/admin", function (req, res){
	// check if user is administrator
	if (req.session.name !== "BenIsAnAdministrator"){
		return res.redirect("/")
	}
	
	res.redirect("/admin/products")
})

// products
router.get("/admin/products", async function (req, res){
	// check if user is administrator
	if (req.session.name !== "BenIsAnAdministrator"){
		return res.redirect("/")
	}
	
	var products = await Product.find({})
	res.render("admin/products", {products: products})
})

// product
router.get("/admin/product/:id", async function (req, res){
	// check if user is administrator
	if (req.session.name !== "BenIsAnAdministrator"){
		return res.redirect("/")
	}
	
	var product_id = req.params.id;
	var product = await Product.findById(product_id)
	res.render("admin/product", {product: product})
})

// create new product
router.get("/admin/create", function (req, res){
	// check if user is administrator
	if (req.session.name !== "BenIsAnAdministrator"){
		return res.redirect("/")
	}
	
	res.render("admin/create")
})

router.post("/admin/create", async function (req, res){
	var product = {
		"name": req.body.name,
		"price": req.body.price,
		"quantity": req.body.quantity,
		"photoUrl": req.body.photoUrl,
		"description": req.body.description
	}
	
	var handle_product = new Product({"name": product["name"], "price": product["price"], "quantity": product["quantity"], "photoUrl": product["photoUrl"], "description": product["description"]});                    
	await handle_product.save()
	res.redirect("/admin")
	
})

// edit product
router.get("/admin/product/edit/:id", async function (req, res){
	// check if user is administrator
	if (req.session.name !== "BenIsAnAdministrator"){
		return res.redirect("/")
	}
	
	var product_id = req.params.id;
	var product = await Product.findById(product_id)
	res.render("admin/edit", {product: product})
})

// edit product
router.put("/admin/product/edit/:id", async function (req, res){
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
	res.redirect("/admin")
})

// delete product
router.delete("/admin/product/delete/:id", async function (req, res){
	var product_id = req.params.id;
	await Product.findByIdAndDelete(product_id);
	res.redirect("/admin")
})



// exports
module.exports = router;