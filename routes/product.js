
var express = require("express");
var router  = express.Router();
var Product = require("../models/product")
var Cart = require("../models/cart")
var Address = require("../models/address")
var Order = require("../models/order")



// landing
router.get("/", function (req, res){
	res.redirect("/products")
})

// show all products
router.get("/products", async function (req, res){
	
	var customer_name = req.session.customer_name
	
	// welcome_message_helper
	if (req.session.welcome_message_helper === true) req.session.welcome_message = true
	else req.session.welcome_message = false
	// helper
	req.session.welcome_message_helper = false
	
	var products = await Product.find({})
	res.render("product/products",
		{ products:products,
		  welcome_message:req.session.welcome_message,
		  customer_name:customer_name })
})

// show one product
router.get("/product/:id", async function (req, res){
	var product_id = req.params.id
	var current_customer = req.session.customer_name
	var product = await Product.findById(product_id)
	
	// cart_added_helper
	if (req.session.cart_added_helper === true) req.session.cart_added = true
	else req.session.cart_added = false
	req.session.cart_added_helper = false
	
	// product_reviewed_helper
	if (req.session.product_reviewed_helper === true) req.session.product_reviewed = true
	else req.session.product_reviewed = false
	req.session.product_reviewed_helper = false
	
	res.render("product/product",
		{product:product,
		 current_customer:current_customer,
		 cart_added:req.session.cart_added,
		 product_reviewed:req.session.product_reviewed})
})

// added to cart
router.post("/product/:id", async function (req, res){
	
	var product_id = req.params.id
	var customer_name = req.session.customer_name
	var product = await Product.findById(product_id)
	var ordered_quantity = req.body.ordered_quantity
	var total = Number(product["price"]) * Number(ordered_quantity)
	var item = {id: Math.floor( Math.random()*10000000001 ), photoUrl: product["photoUrl"], "name": product["name"], ordered_quantity: ordered_quantity, "price": total}      

	var find_product = await Product.findById(product_id)
	find_product["quantity"] = find_product["quantity"] - Number(ordered_quantity)
	// update product
	await Product.findOneAndUpdate({"_id":product_id}, find_product)
	
	
	// customer has no cart yet
	if (req.session.cart === undefined){
		req.session.cart = [item]
		req.session.cart_added_helper = true
		return res.redirect("/product/" + product_id)
	}
	
	// customer has cart already
	if (req.session.cart !== undefined){
		req.session.cart.push(item)
		req.session.cart_added_helper = true
		return res.redirect("/product/" + product_id)
	}
    
})

// add review to the product
router.get("/product/review/:id", async function (req, res){
	var customer_name = req.session.customer_name
	
	// not yet logged in
	if (customer_name === undefined){
		req.session.unknown_customer_helper = true
		return res.redirect("/login")
	}
	
	var product_id = req.params.id
	var product = await Product.findById(product_id)
	
	// customer is already give a review
	for (var i = 0; i < product["reviews"].length; i++){
		 if (product["reviews"][i]["customer_name"] === customer_name){
			 req.session.product_reviewed_helper = true
			 return res.redirect("/product/" + product_id)
		 }
	}
	
	res.render("review/create", {product: product})
})

// add review to the product
router.post("/product/review/:id", async function (req, res){
	var product_id = req.params.id
	var customer_name = req.session.customer_name
	var review = {customer_name: customer_name, review: req.body.review}
	var product = await Product.findById(product_id)
	
	var updated_product = product
	    updated_product["reviews"].push(review)
	
	await Product.findOneAndUpdate({_id: product_id}, updated_product)
	res.redirect("/product/" + product_id)
})

// edit review to the product
router.get("/product/review/edit/:id", async function (req, res){
	var product_id = req.params.id
	var product = await Product.findById(product_id)
	var current_customer = req.session.customer_name
	var my_review = undefined
	for (var i = 0; i < product["reviews"].length; i++){
		 if (current_customer === product["reviews"][i]["customer_name"]){
			 my_review = product["reviews"][i]
			 // stop parent loop
			 break
		 }
	}
	
	res.render("review/edit", {product: product, current_customer: current_customer, my_review: my_review})       
})

// edit review to the product
router.post("/product/review/edit/:id", async function (req, res){
	var product_id = req.params.id
	var product = await Product.findById(product_id)
	var current_customer = req.session.customer_name
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

// edit review (specifically delete)
router.post("/product/reviews/edit/:id", async function (req, res){
	var product_id = req.params.id
	var current_customer = req.session.customer_name
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
	var customer_name = req.session.customer_name
	var cart = req.session.cart
	var subtotal = 0
	if (cart === undefined){
		var cart = []
		return res.render("cart/cart", {cart: cart, subtotal: subtotal})
	}
	
	for (var i = 0; i < cart.length; i++){
		 subtotal = subtotal + cart[i]["price"]
	}
	
	res.render("cart/cart", {cart: cart, subtotal: subtotal})
})

// edit items in cart (specifically delete)
router.post("/cart/edit/:id", async function (req, res){
	var item_id = req.params.id
	var customer_name = req.session.customer_name
	var cart = req.session.cart
	
	var updated_cart = cart
	for (var i = 0; i < updated_cart.length; i++){
		 if ( Number(item_id) === Number(updated_cart[i]["id"]) ){
			 updated_cart.splice(i, 1); break
		 }
	}
	req.session.cart = updated_cart
	res.redirect("/cart")
})

// shipping, address
router.get("/shipping", async function (req, res){
	var customer_name = req.session.customer_name
	
	// customer is not log in
	if (customer_name === undefined){
		req.session.unknown_customer_helper = true
		return res.redirect("/login")
	}
	
	var find_address = await Address.findOne({customer_name: customer_name})
	var address = {street: "", city: "", postal_code: "", country: ""}
	if (find_address === null){
		return res.render("checkout/shipping", {address: address})
	} else {
		address = find_address
		return res.render("checkout/shipping", {address: address})
	}
	
})

// shipping --> get address
router.post("/shipping", async function (req, res){
	var customer_name = req.session.customer_name
	
	// input address
	var input = {customer_name: customer_name,
				 street: req.body.street,
				 city: req.body.city,
				 postal_code: req.body.postal_code,
				 country: req.body.country }
	
	var find_address = await Address.findOne({customer_name: customer_name})
	if (find_address === null){
		var address = new Address({ customer_name: input["customer_name"], street: input["street"], city: input["city"], postal_code: input["postal_code"], country: input["country"] })         
		await address.save()
		res.redirect("/payment")
	} else {
		await Address.findOneAndUpdate({customer_name: customer_name}, input)
		res.redirect("/payment")
	}
	
})

// payment
router.get("/payment", async function (req, res){
	res.render("checkout/payment")
})


// place order
router.get("/place", async function (req, res){
	var customer_name = req.session.customer_name
	var address = await Address.findOne({customer_name: customer_name})
	var cart = req.session.cart
	var partial_total = 0
	for (var i = 0; i < cart.length; i++){
		 partial_total = partial_total + cart[i]["price"]
	}
	var tax = partial_total * 0.05
	var total = partial_total + tax
	res.render("checkout/place", {address: address, cart: cart, partial_total: partial_total, tax: tax, total: total})           
})

// successfully place order --> save to database
router.post("/place", async function (req, res){
	var customer_name = req.session.customer_name
	var id = Math.floor( Math.random()*10000000001 )
	var address = await Address.findOne({customer_name: customer_name})
	var cart = req.session.cart
	var partial_total = 0
	for (var i = 0; i < cart.length; i++){
		 partial_total = partial_total + cart[i]["price"]
	}
	var tax = partial_total * 0.05
	var total = partial_total + tax
	
	var order = new Order({customer_name:customer_name, id:id, address:address, order:cart, partial_total:partial_total, tax:tax, total:total })         
	await order.save()
	
	// empty the cart because order was successfully place
	req.session.cart = undefined
	
	res.redirect("/profile")           
})

// profile
router.get("/profile", async function (req, res){
	var customer_name = req.session.customer_name
	var orders = await Order.find({})	
	var my_orders = []
	
	for (var i = 0; i < orders.length; i++){
		 if (orders[i]["customer_name"] === customer_name){
			 my_orders.push(orders[i])
		 }
	}

	res.render("profile", {my_orders: my_orders})
})


// exports
module.exports = router;