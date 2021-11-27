

//require
var express = require('express')
var bodyParser = require('body-parser')
var ejs = require('ejs')
var methodOverride = require("method-override")
var mongoose = require('mongoose')
var session = require('express-session')

// require routes
var admin = require("./routes/admin")
var index = require("./routes/index")
var product = require("./routes/product")

//use
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(
	session({
		secret: 'secret',
		resave: false,
		saveUninitialized: false,
	})
);

//DATABASE
mongoose.connect(
	"mongodb+srv://Ben:lkiouuuiuiiiiqwsqwwwqwqwqwqwqwqudfrerrriQAQWWQAAAAIIIOUNuuhdgetgdgteeiiu@benshop.kg0ww.mongodb.net/BENSHOP?retryWrites=true&w=majority",
	{ useNewUrlParser: true, useUnifiedTopology: true }
);

var connection = mongoose.connection;
connection.once('open', function () {
	//console.log("Database is now connected")
});



//======
//ROUTES
app.use(admin)
app.use(index);
app.use(product)


//app.listen
app.listen(process.env.PORT || 3000, function () {
	console.log('Server is running.');
	console.log('.');
	console.log('.');
	console.log('.');
})


