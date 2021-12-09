

var express = require("express");
var router  = express.Router();
var nodemailer = require("nodemailer")
var MD5 = require("../helpers/MD5")
var Register = require("../models/register")


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
	
	// password_reset_helper
	if (req.session.password_reset_helper === true) req.session.password_reset = true                   
	else req.session.password_reset = false
	req.session.password_reset_helper = false
	
	
	res.render("login",
	    {
		 account_created: req.session.account_created,
		 incorrect_credential: req.session.incorrect_credential,
		 unknown_customer: req.session.unknown_customer,
		 password_reset:req.session.password_reset
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
	
	// email_taken_helper
	if (req.session.email_taken_helper === true) req.session.email_taken = true
	else req.session.email_taken = false
	req.session.email_taken_helper = false
	
	// weak_password_helper
	if (req.session.weak_password_helper === true) req.session.weak_password = true
	else req.session.weak_password = false
	req.session.weak_password_helper = false
	
	res.render("register",
       {name_taken: req.session.name_taken,
		email_taken:req.session.email_taken,
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
	
	// email is already taken
	var check_email = await Register.findOne({email: data["email"]})
	if (check_email !== null){
		req.session.email_taken_helper = true
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

// reset password
router.get("/reset", function(req, res){
  
  // unknown_email_helper
  if (req.session.unknown_email_helper === true) req.session.unknown_email = true
  else req.session.unknown_email = false
  req.session.unknown_email_helper = false
	
  // reset_email_helper
  if (req.session.reset_email_helper === true) req.session.reset_email = true
  else req.session.reset_email = false
  req.session.reset_email_helper = false
  
  res.render("reset", {unknown_email:req.session.unknown_email, reset_email:req.session.reset_email});
});

// reset password
router.post("/reset", async function(req, res){
    var email = req.body.email
	var customer = await Register.findOne({"email":email})
	// email not found
	if (customer === null){
		req.session.unknown_email_helper = true
		return res.redirect("/reset")
	}
	
	var password = customer["password"]
	
   // nodemailer
   var transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: 'companynodemailer@gmail.com',
       pass: 'CUtEQ_2%c]]=Tw-'         
     }
   });

   var mailOptions = {
     from: '"BENSHOP" <companynodemailer@gmail.com>',
     to: email,
     subject: 'Customer account reset',
	 html: `<!doctype html>
            <html lang="en">
            <head>
              <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Hello, world!</title>
            </head>
            <body>
			
              <h1>Reset your password</h1>
			  <p>Follow this link to reset your customer account password at BENSHOP.
			  <br>
			  If you didn't request a new password, you can safely delete this email.</p>
			  <p>Reset your password <a href="https://sheltered-cliffs-00802.herokuapp.com/reset/true/${email}/${password}" class="btn btn-outline-secondary">here</a>. </p>
      
	          <br>
			  <br>
			  <br>
			  <hr style="color:gray;">
			  <p style="color:gray;">If you have any questions, reply to this email or contact us at BENSHOP</p>
	  
           </body>
         </html>`
   };

   var send_email = await transporter.sendMail(mailOptions)
   // end, nodemailer
   
   // reset email helper
   req.session.reset_email_helper = true
   
   res.redirect("/reset")
});

// reset true
router.get("/reset/true/:email/:password", async function(req, res){
	var email = req.params.email
	var password = req.params.password
	var find_customer = await Register.findOne({"email":email})
	
	// email or password not found
	if (find_customer === null || find_customer["password"] !== password){
		req.session.unknown_email_helper = true
		return res.redirect("/reset")
	}
	
    res.render("resett", {email:email})
})

// reset true
router.post("/reset/true/:email", async function(req, res){
	var email = req.params.email
	var new_password = req.body.password
	var customer = await Register.findOne({"email":email})
	
	var customer_copy = customer
	    customer_copy["password"] = MD5(new_password)
	
	// reset password
	await Register.findOneAndUpdate({"email":email}, customer_copy)
	
	// password_reset_helper
	req.session.password_reset_helper = true
	
	res.redirect("/login")
})


// logout
router.get("/logout", function(req, res){
  req.session.customer_name = undefined
  res.redirect("/login");
});



// exports
module.exports = router;