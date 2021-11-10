
var express = require("express");
var router  = express.Router();
var Product = require("../models/product")
var Cart = require("../models/cart")

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
	
	// added_to_cart session
	if (req.session.added_to_cart_helper === true) req.session.added_to_cart = true
	else req.session.added_to_cart = false
	req.session.added_to_cart_helper = false
	
	res.render("products/product", {product: product, added_to_cart: req.session.added_to_cart})
})

// handle add to cart
router.post("/product/:id", async function (req, res){
	var product_id = req.params.id
	var customer_name = req.session.name
	var product = await Product.findById(product_id)
	var ordered_quantity = req.body.ordered_quantity
	var total = Number(product["price"]) * Number(ordered_quantity)
	var item = {id: Math.floor( Math.random()*10000000001 ), photoUrl: product["photoUrl"], "name": product["name"], ordered_quantity: ordered_quantity, "price": total}      
    var find_cart = await Cart.findOne({customer_name: customer_name})
	
	// if customer has no cart yet
	if (find_cart === null){
		var cart = new Cart({ customer_name: customer_name, cart: [item] })
		await cart.save()
		// req.session.added_to_cart_helper = true
		return res.redirect("/cart")
	}
	
	// if customer has cart already
	if (find_cart !== null){
		find_cart["cart"].push(item)
		var updated_cart = find_cart
		await Cart.findOneAndUpdate({customer_name: customer_name}, updated_cart)
		// req.session.added_to_cart_helper = true
		return res.redirect("/cart")
	}
    
})

// add review to the product
router.get("/product/review/:id", async function (req, res){
	var product_id = req.params.id
	var product = await Product.findById(product_id)
	
	res.render("products/review", {product: product})
})

// add review to the product
router.put("/product/review/:id", async function (req, res){
	var product_id = req.params.id
	var customer_name = req.session.name
	var review = {customer_name: customer_name, review: req.body.review}
	var product = await Product.findById(product_id)
	
	var updated_product = product
	    updated_product["reviews"].push(review)
	
	await Product.findOneAndUpdate({_id: product_id}, updated_product)
	res.redirect("/product/" + product_id)
})

// cart
router.get("/cart", async function (req, res){
	var customer_name = req.session.name
	var cart = await Cart.findOne({customer_name: customer_name})
	var subtotal = 0
	if (cart === null){
		var cart = {cart: []}
		return res.render("products/cart", {cart: cart, subtotal: subtotal})
	}
	
	for (var i = 0; i < cart["cart"].length; i++){
		 subtotal = subtotal + cart["cart"][i]["price"]
	}
	
	res.render("products/cart", {cart: cart, subtotal: subtotal})
})

// delete items in cart
router.put("/cart/edit/:id", async function (req, res){
	var items_id = req.params.id
	var customer_name = req.session.name
	var cart = await Cart.findOne({customer_name: customer_name})
	
	var updated_cart = cart
	for (var i = 0; i < updated_cart["cart"].length; i++){
		 if ( Number(items_id) === Number(updated_cart["cart"][i]["id"]) ){
			 updated_cart["cart"].splice(i, 1); break
		 }
	}
	await Cart.findOneAndUpdate({customer_name: customer_name}, updated_cart)
	res.redirect("/cart")
})




// exports
module.exports = router;