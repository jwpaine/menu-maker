const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const uuidv1 = require('uuid/v1');

var mysql = require('mysql');
var manager = require('./manager.js');
var customer = require('./app/models/customer.js');
var business = require('./app/models/business.js');
var webuser= require('./app/models/webuser.js');
var menu= require('./app/models/menu.js');
var search= require('./app/models/search.js');
var order = require('./app/models/order.js');
var referrals = require('./app/models/referrals.js');
var image = require('./image.js');
var productapi = require('./productapi.js');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var passport = require('passport')




const app = express()

app.use('/static', express.static('public'))

// required for passport
app.use(session({ 
	
	cookie: {
		path : '/',
		httpOnly : false,
		maxAge : 24*60*60*1000
	},
	secret: 'Nhs7Fg58Jjshhr67ujhbvr7hsw34rtghj' ,
	resave: true,
	saveUninitialized: true
	
	})); // session secret

	
app.use(cookieParser()); // read cookies (needed for auth)


app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions




app.set('port', (process.env.PORT || 8080))
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// Process application/json
app.use(bodyParser.json())
// msql
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'takeout',
	password : '',
	database : 'takeout'
  });

const token = "EAAXZCvuosbrIBADf82iwWhMqngoBvWg7EOucu8IvjhgAlwRExvYgnDIrsVKu13B77RlTiDlfRr1j6vjF6OMKBRjESVTcp10SVB4MVLmzboZAQXAp3t1eKOAD6Botb7WIsg5OCcMTWkjZBCRIbwMG8BxdFZA8xnZBSeQ2Bc4ooLgZDZD"
connection.connect(function(err) {
  if (err) {
	console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');

 /*  restaurant.addToMenu(connection, 1, "Drinks", "Pepsi", 1.22, function(cb) {
	console.log(cb)
  }); 
  */

});
require('./config/passport')(connection, passport); // pass passport for configuration
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
		// if user is authenticated in the session, carry on 
		if (req.isAuthenticated())
			return next();
		// if they aren't redirect them to the home page
		res.redirect('/login');
}
// Index route
app.get('/', function (req, res) {
	
	res.render('index.ejs');

});
app.get('/login', function(req, res) {
	// render the page and pass in any flash data if it exists
	res.render('login.ejs'); 
});
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/login')
});
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
	passport.authenticate('facebook', { 
		failureRedirect: '/login' }),
		function(req, res) {
		// Successful authentication, redirect home. 
		res.redirect('/dash');
});
app.get('/mat', isLoggedIn, function(req, res) {
	// render the page and pass in any flash data if it exists
	res.render('mat.ejs'); 
});
app.get('/dash', isLoggedIn, function(req, res) {
	console.log(req.user)
	webuser.grants(connection, req.user.profileid, function(err, r) {
		if (!err) {
			res.render('dash.ejs', {
				user : req.user, // get the user out of session and pass to template
				grants : r
			});
			return
		}
		res.send("Error getting grants");
	});
});

app.post('/refer', function(req, res) {
	var name = req.body.name;
	var address = req.body.address;
	var phone = req.body.phone;
	var email = req.body.email;
	
	console.log("Referal: " + name + "," + address + "," + phone + "," + email);

	referrals.add(connection, name, address, phone, email, req.cookies.search, function(err, r) {
		if (err) {
			console.log(err);
			res.send("error");
			return;
		}

		res.send("ok")
	})
	
});
app.post('/geiger', function(req,res) {

	var products = [{url : 'https://s3.us-east-2.amazonaws.com/geigerskills/1.jpg', price : '22.99' },
			{url : 'https://s3.us-east-2.amazonaws.com/geigerskills/2.jpg', price : '11.95' },
		{url : 'https://s3.us-east-2.amazonaws.com/geigerskills/3.jpg', price : '9.99'},
		{url : 'https://s3.us-east-2.amazonaws.com/geigerskills/4.jpg', price : '17.99'}];
	res.send(products);

});
app.post('/getRestaurants', function(req,res) {
	console.log("Getting Restaurants from post")

	var keyword = req.body.term;
	var radius = req.body.radius

	if (keyword != null) {
		console.log("Using Keyword: " + keyword + " with radius: " + radius + " when getting restaurants")
		url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + keyword + "&key=AIzaSyBDPOu4DAobZxrSJqQnNmOmSbLkTDe9I60"
		
			request(url, function(err, r, body) {  
				console.log("REQUESTING GEOCODE")
				var obj = JSON.parse(body);
				if (obj.status == "OK") {
					console.log("OK")
				///	var city = obj.results[0].address_components[0].long_name;
					var location = obj.results[0].geometry.location;
					var components = obj.results[0].address_components;
					console.log(components)
	
					city = null;
					state = null
					state_short = null;
					country = null;
					route = null;
	
					for (var i in components) {
						if (components[i].types[0] == 'locality') {
							city = components[i].long_name;
							continue
						}
						if (components[i].types[0] == 'administrative_area_level_1') {
							state = components[i].long_name;
							state_short = components[i].short_name;
							continue
						}
						if (components[i].types[0] == 'country') {
						country = components[i].long_name;
							continue
						}
						if (components[i].types[0] == 'route') {
							route = components[i].long_name;
							continue
						}
	
					}
					// set search cookie
					var searchCookie = {
						lat : location.lat,
						lon : location.lng,
						route : '',
						city : city,
						state : state_short
					}
					if (route !== null) {
						searchCookie.route = route
					}
					res.clearCookie(search);
					res.cookie('search', searchCookie, { maxAge: 900000, httpOnly: true });
					// add search to database
					search.add(connection, keyword, city, state, state_short, country, location.lat, location.lng, function(err, r) {
						if (err) {
							console.log(err);
						}
					});
						// search for business
					business.search(connection, searchCookie, radius, function(err, r) {
						if (!err) {
							console.log(r)
							res.send({restaurants : r, location : searchCookie}); // send restaurants
							return
						}
						res.send("Error searching restaurants");
					});
						
					return;
					
				}
				// status from places API was not "OK"
				console.log("not ok")
				res.send("check_address")
				return;
				
			});
		return;
	} 

	// use cookie for search (this will be default if searching from splash page)
	var location = req.cookies.search;
	if (location != undefined) {
		console.log("location cookie set")
		console.log("Using radius: " + radius)
		business.search(connection, location, radius, function(err, r) {
			if (!err) {
				console.log(r)
				res.send({restaurants : r, location : location}); // send restaurants
				return
			}
			res.send("Error searching restaurants");
		});
		return
	}
	// no cookie set and no search term given, don't send anything
	console.log("no cookie set and no search term given, don't send anything")
	res.send('none');

});
app.get('/restaurants/:search', function(req, res) {

	var keyword = req.params.search;
	console.log(keyword)
	res.clearCookie(search);
	url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + keyword + "&key=AIzaSyBDPOu4DAobZxrSJqQnNmOmSbLkTDe9I60"

	request(url, function(err, r, body) {  
		var obj = JSON.parse(body);
		if (obj.status == "OK") {
		///	var city = obj.results[0].address_components[0].long_name;
			var location = obj.results[0].geometry.location;

			var components = obj.results[0].address_components;
			console.log(components)

			city = null;
			state = null
			state_short = null;
			country = null;
			route = null;

			for (var i in components) {
				if (components[i].types[0] == 'locality') {
					city = components[i].long_name;
					continue
				}
				if (components[i].types[0] == 'administrative_area_level_1') {
					state = components[i].long_name;
					state_short = components[i].short_name;
					continue
				}
				if (components[i].types[0] == 'country') {
				country = components[i].long_name;
					continue
				}
				if (components[i].types[0] == 'route') {
					route = components[i].long_name;
					continue
				}
			}
	
			search.add(connection, keyword, city, state, state_short, country, location.lat, location.lng, function(err, r) {
				if (err) {
					console.log(err);
				}
				var searchCookie = {
					lat : location.lat,
					lon : location.lng,
					route : '',
					city : city,
					state : state_short
				}
				if (route !== null) {
					searchCookie.route = route
				}
				
				res.cookie('search', searchCookie, { maxAge: 900000, httpOnly: true });
					res.redirect("/restaurants")
				})

			return;
		}
		console.log("bad address")
	
		res.redirect("/restaurants")

	});
	
	
		
	});
app.get('/restaurants', function(req, res) {

	var location = req.cookies.search;
	if (location === undefined) {
		console.log("cookie not set")
		res.render('restaurants.ejs', {
			user : req.user, 
			location : null
		});
		return;
	}
		console.log("cookie set")
		res.render('restaurants.ejs', {
			user : req.user,
			location : location
		});
			

});
app.get('/account', isLoggedIn, function(req, res) {
	console.log(req.user)
		res.render('account.ejs', {
			user : req.user, // get the user out of session and pass to template
		});
});
app.get('/privacy', function(req, res) {
	res.render('privacy.ejs');
});
// get page for business
app.post('/setAccessToken', isLoggedIn, function(req,res) {
		// check user has permission
		webuser.grant(connection, req.user.profileid, req.body.id, function(err, grant) {
			if (err) {
				res.send(err)
				return
			}
			if (grant) {
					var token = req.body.token
					// test token
					request.post({
						headers: {'content-type' : 'application/x-www-form-urlencoded'},
						url:     "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=" + token
					  }, function(error, response, body){
						  console.log(body)
						if (body.indexOf("true") != -1) {
							console.log("Messenger activated for endpoint: " + req.body.id);
							// SAVE TOKEN
							business.updateToken(connection, req.body.id, token, function(err, r) {
								if (err) {
									console.log(err);
									res.send("fail");
									return
								}
								res.send("success");
							});
							return
						}
							res.send("invalid");
					  });
			}
		});
	});
	
// get page for business
app.post('/getAccessToken', isLoggedIn, function(req,res) {
	/* EAAXZCvuosbrIBADf82iwWhMqngoBvWg7EOucu8IvjhgAlwRExvYgnDIrsVKu13B77RlTiDlfRr1j6vjF6OMKBRjESVTcp10SVB4MVLmzboZAQXAp3t1eKOAD6Botb7WIsg5OCcMTWkjZBCRIbwMG8BxdFZA8xnZBSeQ2Bc4ooLgZDZD */
	// check user has permission
	console.log("User: " + req.user.profileid + " Requested Access Token for business: " + req.body.id);

	webuser.grant(connection, req.user.profileid, req.body.id, function(err, grant) {
		if (err) {
			res.send(err)
			return
		}
		if (grant) {
			// trigger send messages
	//		curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=<PAGE_ACCESS_TOKEN>"
			business.getToken(connection, req.body.id, function(err, r) {
				if (err) {
					console.log(err);
					res.send('')
					return
				}
				res.send(r[0].accessToken)
			})
		}
	});
});


app.get('/b/:id/manage', isLoggedIn, function (req, res) {
	// check user has permission
	webuser.grant(connection, req.user.profileid, req.params.id, function(err, grant) {
		if (err) {
			res.send(err)
			return
		}
		if (grant) {
			// get info for business:
			business.info(connection, req.params.id, function(err, r) {
				if (err) {
					res.send(err)
					return;
				}

				res.render('admin.ejs', {
					user : req.user, // get the user out of session and pass to template
					business : {
						id : req.params.id,
						name : r[0].name,
						image : "https://s3.us-east-2.amazonaws.com/takeout.photos/" + r[0].image

					}
				});
			});
			return
		}
		
		res.send("Permission Denied")
	});
}); 
 app.get('/b/:id/', function (req, res) { 

	// if has grant, redirect to management page
	if (req.user != undefined) {
		webuser.grant(connection, req.user.profileid, req.params.id, function(err, grant) {
			if (err) {
				console.log(err);
			}
			if (grant) {
				res.redirect('/b/'+req.params.id+'/manage');
				return;
			}
		});
	}



	 console.log("requested page" + req.params.id); 
	
			business.info(connection, req.params.id, function(err, r) {
				if (err) {
					res.send(err)
					return;
				}

				if (r.length == 0) {
					res.send("foo");
					return;
				}

				res.render('business.ejs', {
				//	user : req.user, // get the user out of session and pass to template
					business : {
						id : req.params.id,
						name : r[0].name,
						image : "https://s3.us-east-2.amazonaws.com/takeout.photos/" + r[0].image

					}
				});
			});
		
});

app.get('/menu/:id', isLoggedIn, function (req, res) {
	// check user has permission
	webuser.grant(connection, req.user.profileid, req.params.id, function(err, grant) {
		if (err) {
			res.send(err)
			return
		}
		if (grant) {
			menu.getCategories(connection, req.params.id, function (err,data) {
				if (err) {
					res.send(err)
					return
				}
				var categories = []
				for (var i in data) {
					var category = {
						name : data[i].category,
						image : data[i].image,
						category : true
					}
					categories.push(category)
				}
				console.log(categories)
				
			res.render('menu.ejs', {
				user : req.user, // get the user out of session and pass to template
				business : {
					id : 1
				},
				categories : categories
				});
			});
			
			return
		}

		res.send("Permission Denied")
	});
});
app.post('/addBusiness', isLoggedIn, function(req, res) {

	var owner = req.user.profileid
	var name = req.body.name
	var zip = req.body.zipcode
	var category = req.body.category
	

	image.fetch(req.body.image, function(err, image_name){
		console.log("Fetching image and uploading to s3")

		if (err) {
			console.log("Error fetching image: " + err);
			res.send("error")
			return;
		}

		console.log(webuser + "," + name + "," + zip + "," + category + "," + image_name);
		business.add(connection, name, zip, category, owner, image_name, function(err, r) {
			if (err) {
				console.log(err);
				return
			}
			console.log(r);
		})

	});
	

})

app.post('/getOrder', function(req,res) {
	
	console.log("front-end wants current order")
	var ordercookie = req.cookies.order;

	if (!ordercookie) {
		console.log("order cookie does not exist")
		res.send("err");
	} else {
		order.get(connection, ordercookie.id, null, function(err, r) {
			if (err) {
				res.send("err")
				return
			}
			console.log(r)
			// send order
			res.send(r)
		})
	}

});

app.post('/addToOrder', function(req,res) {
	
	var id = req.body.id;
	var item = JSON.parse(req.body.item)

	var ordercookie = req.cookies.order;

	if (!ordercookie) {
		console.log("order cookie does not exist")
		ordercookie = {
			id : uuidv1(),
			items : []
		}
	} else {
		console.log("order cookie exists and here it is:");
		console.log(order);
	}
	console.log("User is adding item: " + item.name + " from restaurant: " + id)
	ordercookie.items.push({"restaurant" : id, "item" : item.name});
	// update cookie


	

	if (req.user === undefined) {
		console.log("user not logged in");
		
		order.addItem(connection, id, null, ordercookie.id, item.name, function(err, r) {
			if (err) {
				console.log(err);
				res.send("err");
				return;
			}
			// update cookie after successful item add
			res.cookie('order', ordercookie, { maxAge: 900000, httpOnly: true });
			console.log("Items in cart: ")
			console.log(ordercookie.items)
			res.send('ok');
		});
	} else {
		console.log("user logged in");
		order.addItem(connection, id, req.user.profileid, ordercookie.id, item.name, function(err, r) {
			if (err) {
				console.log(err);
				res.send("err");
				return;
			}
			// update cookie after successful item add
			res.cookie('order', ordercookie, { maxAge: 900000, httpOnly: true });
			console.log("Items in cart: ")
			console.log(ordercookie.items)
			res.send('ok');
		});
	}

});

app.post('/removeOrderItem', function (req, res) {
	var id = req.body.id
	console.log("removing order item: " + id)
	var ordercookie = req.cookies.order;

	if (!ordercookie) {
		console.log("order cookie does not exist")
		res.send("err");
		return
	}
	order.removeItem(connection, id, ordercookie.id, function(err, r) {
		if (err) {
			console.log(err);
			res.send("err");
			return;
		}
		res.send("ok")
	});
});
app.post('/categories', function (req, res) {
		var id = req.body.id
		console.log("Requested categories for business: " + id)
		menu.getCategories(connection, id, function (err,data) {
			if (err) {
				res.send(err)
				return
			}
			var categories = []
			for (var i in data) {
				
				var category = {
					name : data[i].category,
					image : image.endpoint() + data[i].image,
					category : true,
					subCategory : false
				}
				categories.push(category)
			}
		//	console.log(categories)
			res.send(categories)
		});
	});
	//  
	app.post('/options', function(req,res) {
		var id = req.body.id
		var category = req.body.category
		console.log('getting options for restaurant: ' + id + " with category: " + category);
		menu.getOptions(connection, businessId, category, function(err, r) {
			if (err) {
				console.log(err);
				res.send('err');
				return
			}
			res.send(r);
		}) 
	})
	app.post('/subCategories', function (req, res) {
		// check user has permission
		var id = req.body.id
		var category = req.body.category
		console.log("Requested SubCategories for business: " + id + " category: " + category)
		menu.getSubCategories(connection, id, category, function (err,data) {
			if (err) {
				res.send(err)
				return
			}
			var categories = []
			for (var i in data) {
				var category = {
					name : data[i].category,
					image : image.endpoint() + data[i].image,
					category : true,
					subCategory : true
				}
				categories.push(category)
			}
			console.log(categories)
			res.send(categories)
		});
	});
//	isLoggedIn wigglewiggle
	app.post('/items', function (req, res) {
		// check user has permission
		
		var id = req.body.id
		var category = req.body.category
		console.log("Requested items for business: " + id + " category: " + category)
		menu.getItems(connection, id, category, function (err,data) {
			if (err) {
				res.send(err)
				return
			}
			var items = []
			// instead of creating collection just to include the endpoint url, return data directly from database and have frontend concat image url and image uuid
			for (var i in data) {
				var item = {
					name : data[i].item,
					price : data[i].price,
					image : image.endpoint() + data[i].image,
					description : data[i].description,
					option : data[i].option
				}
				items.push(item)
			}
			console.log(items)
			res.send(items)
		});
	});
	app.post('/addCategory', isLoggedIn, function(req, res) {
		// check if user has permission to add
		webuser.grant(connection, req.user.profileid, req.body.id, function(err, grant) {
			if (err) {
				res.send(err)
				return
			}
			if (grant) {
				image.fetch(req.body.image, function(err, image_name){
					console.log("Fetching image and uploading to s3")

					if (err) {
						console.log("Error fetching image: " + err);
						res.send("error")
						return;
					}

					console.log("Adding category: " + req.body.category + "for business: " + req.body.id)
					menu.addCategory(connection, req.body.id, req.body.category, image_name, function(err,cb) {
						if (err) {
							res.send("Error");
							return
						}
						console.log(cb)
						res.send("" + cb)
					})

				});
			
				return
			}
			res.send("Permission Denied")
		});
	});
	app.post('/deleteCategory', isLoggedIn, function(req, res) {
		// check if user has permission to add
		webuser.grant(connection, req.user.profileid, req.body.id, function(err, grant) {
			if (err) {
				res.send(err)
				return
			}
			if (grant) {
				var id = req.body.id;
				var category = req.body.category;
				console.log("deleting category: " + category + "for business: " + id)
				
				menu.deleteCategory(connection, id, category, function(err, r) {
					if (err) {
						res.send("fail")
						return
					}
					res.send("success")
				})
				return;
			}
			console.log("Permission denied")
		})
	});

	app.post('/deleteItem', isLoggedIn, function(req, res) {
		// check if user has permission to add
		webuser.grant(connection, req.user.profileid, req.body.id, function(err, grant) {
			if (err) {
				res.send(err)
				return
			}
			if (grant) {
				var id = req.body.id;
				var item = req.body.item;
				console.log("deleting item: " + item + "for business: " + id)
				
				menu.deleteItem(connection, id, item,function(err, r) {
					if (err) {
						res.send("fail")
						return
					}
					res.send("success")
				})
				return;
			}
			console.log("Permission denied")
		})
	});


	app.post('/addItem', isLoggedIn, function(req, res) {
		// check if user has permission to add
		webuser.grant(connection, req.user.profileid, req.body.id, function(err, grant) {
			if (err) {
				res.send(err)
				return
			}
			if (grant) {
				// fetch image, upload to s3, return image name
			image.fetch(req.body.image, function(err, image_name){
					console.log("Fetching image and uploading to s3")

					if (err) {
						console.log("Error fetching image: " + err);
						res.send("error")
						return;
					}

					console.log("Adding item: " + req.body.name + "to category: " + req.body.category + "For business: " + req.body.id + "with asin: " + req.body.asin + " with link: " + req.body.link)
					// get item price from amazon:
					productapi.price(req.body.asin, function(err, price) {
						if (err) {
							console.log(err);
							res.send("error");
							return
						}
						// add item to database
						menu.addItem(connection, req.body.id, req.body.category, req.body.name, req.body.description, price, image_name, req.body.option, req.body.asin, req.body.link, function(err,cb) {
							if (err) {
								res.send("Error");
								return
							}
							console.log(cb)
							res.send("" + cb)
						})
						return
					  }); 
					  
					
					
					})

					return
				
			}
			res.send("Permission Denied")
		});
	});
// for Facebook verification
app.get('/webhook/:id', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
});
// endpoint
app.post('/webhook/:id', function (req, res) {

	console.log("Endpoint id: " + req.params.id)
	var endpoint = req.params.id;
	console.log(req.body)
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {

        let event = req.body.entry[0].messaging[i]
		console.log(event)
        let sender = event.sender.id
		console.log("Sender: " + sender)
		// get user
		customer.find(connection, sender, function(cb) {
			// user not found, create
			if (cb.length == 0) {
				console.log("Customer not found")
				customer.add(connection, sender, function(cb) {
					if (cb == 1) {
						console.log("Customer added")
							// send initial welcome message
							let messageData = { text:"Hello! I'm Ordersup! I'm here to help you find and order takeout from restaurants in your area." }
							sendMessage(sender, endpoint, messageData)
					} else {
						console.log(cb)
					}
				});
				return
			}
			console.log("customer exists")
			/* do stuff with message */
			if (event.postback && event.postback.payload) {
				payload = event.postback.payload;
				// Handle a payload from this sender
				console.log("postback: " + payload)
				let messageData = { text: payload }
				manager.act(connection, sender, req.params.id, payload, function(cb) {
					sendMessage(sender,endpoint,cb)
				});
				return
			  }

			  if(event.payment) {
				  console.log("User clicked pay!")
				  manager.checkout(connection, sender, event.payment, function(cb) {
					sendMessage(sender,endpoint,cb)
				});
				return
			  }
		/*	if (event.message && event.message.text) {
				console.log("received: " + event.message.text)
				customer.updateLastMessaged(connection, sender, function(cb) {
					console.log("Updated last messaged date");
					console.log(cb);
				});
				manager(sender, req.params.id, event.message.text, function(cb) {
					sendMessage(sender,cb)
				});
			} */
		})
    }
	res.sendStatus(200)
})

function sendMessage(sender, endpoint, messageData) {
	console.log("Replying to user: " + sender)
	// get token for endpoint
	business.getToken(connection, endpoint, function(err, r) {
		if (err) {
			console.log(err);
			return
		}
		// send reply to endpoint using accessToken
		request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: {access_token:r[0].accessToken},
			method: 'POST',
			json: {
				recipient: {id:sender},
				message: messageData,
			}
		}, function(error, response, body) {
			if (error) {
				console.log('Error sending messages: ', error)
			} else if (response.body.error) {
				console.log('Error: ', response.body.error)
			}
		})
	})
}
// Spin up server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
