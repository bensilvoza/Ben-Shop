
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
	var current_customer = req.session.name
	var product = await Product.findById(product_id)
	
	// added_to_cart session
	if (req.session.added_to_cart_helper === true) req.session.added_to_cart = true
	else req.session.added_to_cart = false
	req.session.added_to_cart_helper = false
	
	res.render("products/product", {product: product, current_customer: current_customer, added_to_cart: req.session.added_to_cart})
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
	
	res.render("reviews/create", {product: product})
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

// edit - review to the product
router.get("/product/review/edit/:id", async function (req, res){
	var product_id = req.params.id
	var product = await Product.findById(product_id)
	var current_customer = req.session.name
	var my_review = undefined
	for (var i = 0; i < product["reviews"].length; i++){
		 if (current_customer === product["reviews"][i]["customer_name"]){
			 my_review = product["reviews"][i]
			 // stop parent loop
			 break
		 }
	}
	
	res.render("reviews/edit", {product: product, current_customer: current_customer, my_review: my_review})       
})

// edit - review to the product
router.put("/product/review/edit/:id", async function (req, res){
	var product_id = req.params.id
	var product = await Product.findById(product_id)
	var current_customer = req.session.name
	var updated_review = undefined
	for (var i = 0; i < product["reviews"].length; i++){
		 if (current_customer === product["reviews"][i]["customer_name"]){
			 updated_review = product["reviews"][i]
			 // stop parent loop
			 break
		 }
	}
	updated_review["review"] = req.body.review
	
	// find that product where review will be updated
	var updated_product = product
	for (var i = 0; i < updated_product["reviews"].length; i++){
		 if (current_customer === updated_product["reviews"][i]["customer_name"]){
			 updated_product["reviews"][i] = updated_review
			 // stop parent loop
			 break
		 }
	}
	
	await Product.findByIdAndUpdate({_id: product_id}, updated_product)
	
	return res.redirect("/product/" + product_id)
})

// edit reviews (specifically delete)
router.put("/product/reviews/edit/:id", async function (req, res){
	var product_id = req.params.id
	var current_customer = req.session.name
	var product = await Product.findById(product_id)
	var updated_product = product
	for (var i = 0; i < updated_product["reviews"].length; i++){
		 if (current_customer === updated_product["reviews"][i]["customer_name"]){
			 updated_product["reviews"].splice(i, 1)
			 // stop parent loop
			 break
		 }
	}
	
	await Product.findByIdAndUpdate({_id: product_id}, updated_product)
	return res.redirect("/product/" + product_id)
})

// cart
router.get("/cart", async function (req, res){
	var customer_name = req.session.name
	var cart = await Cart.findOne({customer_name: customer_name})
	var subtotal = 0
	if (cart === null){
		var cart = {cart: []}
		return res.render("cart/cart", {cart: cart, subtotal: subtotal})
	}
	
	for (var i = 0; i < cart["cart"].length; i++){
		 subtotal = subtotal + cart["cart"][i]["price"]
	}
	
	res.render("cart/cart", {cart: cart, subtotal: subtotal})
})

// edit items in cart (specifically delete)
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

// cart
router.get("/cart", async function (req, res){
	var customer_name = req.session.name
	var cart = await Cart.findOne({customer_name: customer_name})
	var subtotal = 0
	if (cart === null){
		var cart = {cart: []}
		return res.render("cart/cart", {cart: cart, subtotal: subtotal})
	}
	
	for (var i = 0; i < cart["cart"].length; i++){
		 subtotal = subtotal + cart["cart"][i]["price"]
	}
	
	res.render("cart/cart", {cart: cart, subtotal: subtotal})
})



// exports
module.exports = router;