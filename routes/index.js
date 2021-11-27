

var express = require("express");
var router  = express.Router();
var MD5 = require("../helpers/MD5")
var Register = require("../models/register");


// login
router.get("/login", function (req, res){
	
	// customer is login already
	if (req.session.customer_name !== undefined){
		return res.redirect("/profile")
	}
	
	// unknown_customer_helper
	if (req.session.unknown_customer_helper === true) req.session.unknown_customer = true
	else req.session.unknown_customer = false
	req.session.unknown_customer_helper = false
	
	// account_created_helper
	if (req.session.account_created_helper === true) req.session.account_created = true     
	else req.session.account_created = false
	req.session.account_created_helper = false
	
	// incorrect_credential_helper
	if (req.session.incorrect_credential_helper === true) req.session.incorrect_credential = true                   
	else req.session.incorrect_credential = false
	req.session.incorrect_credential_helper = false
	
	res.render("login",
	    {
		 account_created: req.session.account_created,
		 incorrect_credential: req.session.incorrect_credential,
		 unknown_customer: req.session.unknown_customer
	    }
	)
})

// login
router.post("/login", async function (req, res){
	var data = {name:req.body.name, password:req.body.password}

	
	// MD5 Algorithm
	var hash = MD5(data["password"])
	
	var customer = await Register.findOne({name: data["name"]})
	
	// name is not present on the database
	if (customer === null){
		req.session.incorrect_credential_helper = true
		res.redirect("/login")
	}
	
	
	if (hash === customer["password"]){
		req.session.customer_name = data["name"]
		// welcome message
	    req.session.welcome_message_helper = true
		
		// if user is administrator
		if (hash === "1d5702dbeedd1a328876d9d37606f899") res.redirect("/admin")
		else res.redirect("/")
	} else {
		req.session.incorrect_credential_helper = true
		res.redirect("/login")
	}
})

// create account
router.get("/register", function (req, res){
	
	// name_taken_helper
	if (req.session.name_taken_helper === true) req.session.name_taken = true
	else req.session.name_taken = false
	req.session.name_taken_helper = false
	
	// weak_password_helper
	if (req.session.weak_password_helper === true) req.session.weak_password = true
	else req.session.weak_password = false
	req.session.weak_password_helper = false
	
	res.render("register",
       {name_taken: req.session.name_taken,
    	weak_password: req.session.weak_password
	   }
	)
})

// create account
router.post("/register", async function (req, res){
	var data = {name: req.body.name,
			    email: req.body.email,
			    password: req.body.password,
			    confirm_password: req.body.confirm_password
	}
	
	
	// name is already taken
	var check_name = await Register.findOne({name: data["name"]})
	if (check_name !== null){
		req.session.name_taken_helper = true
		return res.redirect('/register');
	}
	
	// weak password
	if (data["password"].length < 6){
		req.session.weak_password_helper = true
		return res.redirect('/register');
	}
	
	
	// MD5 Algorithm
	var hash = MD5(data["password"]);
	
	var customer = new Register({ "name": data["name"], "email": data["email"], "password": hash })     
	await customer.save()
	
	// account succesfully created
	req.session.account_created_helper = true
	res.redirect("/login")
})

// logout
router.get("/logout", function(req, res){
  req.session.customer_name = undefined
  res.redirect("/login");
});



// exports
module.exports = router;