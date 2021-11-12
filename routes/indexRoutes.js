
var express = require("express");
var router  = express.Router();
var MD5 = require("../helpers/MD5")
var Register = require("../models/register");


// login
router.get("/login", function (req, res){
	
	// check if customer is login already
	if (req.session.name !== undefined){
		return res.redirect("/profile")
	}
	
	// anonymous customer session
	if (req.session.customer_anonymous_helper === true) req.session.customer_anonymous = true
	else req.session.customer_anonymous = false
	req.session.customer_anonymous_helper = false
	
	// session for account succesfully created session
	if (req.session.account_successfully_created_helper === true) req.session.account_successfully_created = true     
	else req.session.account_successfully_created = false
	req.session.account_successfully_created_helper = false
	
	// session for incorrect password email helper
	if (req.session.incorrect_password_email_helper === true) req.session.incorrect_password_email = true                   
	else req.session.incorrect_password_email = false
	req.session.incorrect_password_email_helper = false
	
	res.render("login",
	    {
		 account_successfully_created: req.session.account_successfully_created,
		 incorrect_password_email: req.session.incorrect_password_email,
		 customer_anonymous: req.session.customer_anonymous
	    }
	)
})

// login
router.post("/login", async function (req, res){
	var data = {name: req.body.name,
			    password: req.body.password,
	}
	
	
	// MD5 Algorithm
	var hash = MD5(data["password"])
	
	var customer = await Register.findOne({name: data["name"]})
	// name is not present on the database
	if (customer === null){
		req.session.incorrect_password_email_helper = true
		res.redirect("/login")
	}
	
	if (hash === customer["password"]){
		req.session.name = data["name"]
		res.redirect("/")
	} else {
		req.session.incorrect_password_email_helper = true
		res.redirect("/login")
	}
})

// create account
router.get("/register", function (req, res){
	
	// name_taken session
	if (req.session.name_taken_helper === true) req.session.name_taken = true
	else req.session.name_taken = false
	req.session.name_taken_helper = false
	
	// unmatch password session
	if (req.session.unmatch_password_helper === true) req.session.unmatch_password = true
	else req.session.unmatch_password = false
	req.session.unmatch_password_helper = false
	
	// weak password session
	if (req.session.weak_password_helper === true) req.session.weak_password = true
	else req.session.weak_password = false
	req.session.weak_password_helper = false
	
	res.render("register",
       {name_taken: req.session.name_taken,
	    unmatch_password: req.session.unmatch_password,
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
	
	// check if name is empty
	if (data["name"] === "") return res.redirect("/register")
	
	// check if name is already taken
	var check_name = await Register.findOne({name: data["name"]})
	if (check_name !== null){
		// send signal name is already taken
		req.session.name_taken_helper = true
		return res.redirect('/register');
	}
	
	// check if password do not match
	if (data["password"] !== data["confirm_password"]){
		// send signal password do not match
		req.session.unmatch_password_helper = true
		return res.redirect('/register');
	}
	
	// check password length
	if (data["password"].length < 6){
		// send signal password is to short
		req.session.weak_password_helper = true
		return res.redirect('/register');
	}
	
	
	// MD5 Algorithm
	var hash = MD5(data["password"]);
	
	var customer = new Register({ "name": data["name"], "email": data["email"], "password": hash })     
	await customer.save()
	
	// account succesfully created
	req.session.account_successfully_created_helper = true	
	res.redirect("/login")
})

// logout
router.get("/logout", function(req, res){
  req.session.name = undefined
  res.redirect("/login");
});



// exports
module.exports = router;