var business = require('./app/models/business.js');
var customer = require('./app/models/customer.js');
var menu = require('./app/models/menu.js');
var order = require('./app/models/order.js');
var image = require('./image.js');

exports.act = function(connection, sender, businessId, received, cb) {
    var i = received.split(":")
    customer.updateLastMessaged(connection, sender, function(err, c) {
        if (err) {
            console.log(err)
            return
        }
    })
	switch(i[0]) {
        case 'checkout':
            break;
        case 'remove' :
            id = parseInt(i[1]);
            console.log("Removing order id: " + id)
            order.remove(connection, id, sender, function(err, r) {
                if (!err) {
                    getOrder(connection, sender, function(err, callback) {
                        if (!err) {
                            cb(callback)
                        }
                    })
                }
            })
            break;
        case 'getorder' :
            getOrder(connection, sender, function(err, callback) {
                if (!err) {
                    cb(callback)
                }
            })
            break
        case 'items' :
            	// items:category:id
				category = i[1];
				id = parseInt(i[2]);
				items(connection, id, category, function(callback) {
					cb(callback);
				});
				break
		case 'menu':
			categories(connection, parseInt(i[1]), function(callback) {
				cb(callback);
			});
			break;
		case 'restaurant' :
			if (i[1] == 'getall') {
				restaurants(connection, function(callback) {
					cb(callback);
				})
				break;
            }
        case 'add':
            item = i[1];
            category = i[2];
            businessid = i[3];
            addToOrder(connection, sender, item, category, false, businessid, function(err, callback) {
                if (!err) {
                    cb(callback)
                }
            })
            break
        case 'addoption':
            item = i[1];
            category = i[2];
            businessid = i[3];
            addToOrder(connection, sender, item, category, true, businessid, function(err, callback) {
                if (!err) {
                    cb(callback)
                }
            })
            break
        default:
            let messageData = { text:"Hello! I'm Ordersup! I'm here to help you find and order takeout from restaurants in your area." }
			cb(messageData)
	}
}
exports.checkout = function(connection, sender, payment, cb) {
    console.log("Payment Received from user: " + sender);
    console.log(payment);
    cb({ text:"We're working on your order!" })
}
function getOrder(connection, customerid, cb) {
    order.get(connection, customerid, function(err, r) {
        
        if (!err) {
            if (r.length == 0) {
                console.log("No Items in order")
                cb(null, { text:"An empty order :( why not add something yummy! 🍕" })
                return;
            }
            var t = new Template();
            var item = new Element("Review Your Order", "https://brokenlink.jpg");
            var prices = [{"label":"bacon","amount":"1.00"},{"label":"Subtotal","amount":"1"},{"label":"Taxes","amount":"0.08"}]
            item.addPaymentButton("The Family Dog", prices)
            t.addElement(item);
            for (var i in r) {
                var item = new Element(r[i].item + ": $" + r[i].price, image.endpoint() + r[i].image);
                item.addButton("Remove", "remove:" + r[i].id)
                t.addElement(item);
            }
            cb(null, t.messageData);
            return
        }
        cb(err, null);
    });
      
}
function restaurants(connection, cb) {
    business.getAll(connection, function(r) {
        var t = new Template();
        for (var i in r) {
            var restaurant = new Element(r[i].name, "https://s3.us-east-2.amazonaws.com/takeout.photos/" + r[i].image);
            restaurant.addButton("Our Menu", "menu:" + r[i].id )
            t.addElement(restaurant);
        }
        cb(t.messageData);
    });
}

function categories(connection, businessId, cb) {
    menu.getCategories(connection, businessId, function(err, r) {
        if (!err) {
            var t = new Template();
            for (var i in r) {
                var category = new Element(r[i].category, image.endpoint() + r[i].image);
                category.addButton("Select", "items:" + r[i].category + ":" + businessId )
                t.addElement(category);
                }
            cb(t.messageData);
        }
    })
}


function items(connection, businessId, category, cb) {
    menu.getItems(connection, businessId, category, function(err, r) {
        if (err) return;
        var t = new Template();
        for (var i in r) {
            var item = new Element(r[i].description + ": $" + r[i].price, image.endpoint() + r[i].image);
            item.addButton("Add To Order", "add:" + r[i].item + ":" + category + ":" + businessId )
            t.addElement(item);
        }
        cb(t.messageData);
    });
}
/* dynamic templates */
function Template() {
    this.messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements": []
            }
        }
    }
    this.addElement = function(element) {
        this.messageData.attachment.payload.elements.push(element.data);
    }
}

function Element(title, image_url) {
    this.data = {
        "title" : title,
        "image_url": image_url,
        "buttons":[]
    }
    this.addButton = function(title, payload) {
        var button = {
            "type":"postback",
            "title": title,
            "payload": payload
        };
        this.data.buttons.push(button)
    }
    this.addPaymentButton = function(business, prices) {
        var button = {
            "type":"payment",
              "title":"buy",
              "payload":"DEVELOPER_DEFINED_PAYLOAD",
              "payment_summary":{
                "currency":"USD",
                "payment_type":"FIXED_AMOUNT",
                "is_test_payment" : true, 
                "merchant_name": business,
                "requested_user_info":[
                  "contact_name",
                  "contact_phone",
                ],
                "price_list": prices
              }
            }
        this.data.buttons.push(button)
    }
}
function addToOrder(connection, customerid, item, category, option, businessid, cb) {
    console.log("customer: " + customerid);
    order.addItem(connection, businessid, customerid, item, function (err, r) {
        if (err) {
            console.log(err);
            cb(err, null)
            return
        }
        if (r == 1) {
            // get options for item added if the item added wasn't already an option
             //   cb(null, { text:"Item added to order!" });
             menu.getSubCategories(connection, businessid, category, function(err, r) {
                if (!err) {
                    var t = new Template();
                    for (var i in r) {
                        var category = new Element(r[i].category, image.endpoint() + r[i].image);
                        category.addButton("Select", "items:" + r[i].category + ":" + businessid )
                        t.addElement(category);
                        }
                    cb(null, t.messageData);
                    return
                }
                cb(err, null)
            })
            cb(null, { text:"added " + item });
        }
    });
}
function checkout(connection, customerid, cb) {
    var t = new Template();
    for (var i in r) {
        var item = new Element(r[i].description + ": $" + r[i].price, image.endpoint() + r[i].image);
        item.addButton("Add To Order", "add:" + r[i].item + ":" + category + ":" + businessId )
        t.addElement(item);
    }
}
function Receipt() {
    var messageData = {
        "attachment":{
            "type":"template",
            "payload":{
              "template_type":"receipt",
              "recipient_name":"Stephane Crozatier",
              "order_number":"12345678902",
              "currency":"USD",
              "payment_method":"Visa 2345",        
              "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
              "timestamp":"1428444852",         
              "address":{
                "street_1":"1 Hacker Way",
                "street_2":"",
                "city":"Menlo Park",
                "postal_code":"94025",
                "state":"CA",
                "country":"US"
              },
              "summary":{
                "subtotal":75.00,
                "shipping_cost":4.95,
                "total_tax":6.19,
                "total_cost":56.14
              },
              "adjustments":[
                {
                  "name":"New Customer Discount",
                  "amount":20
                },
                {
                  "name":"$10 Off Coupon",
                  "amount":10
                }
              ],
              "elements":[
               
                  
                {
                  "title":"Classic White T-Shirt",
                  "subtitle":"100% Soft and Luxurious Cotton",
                  "quantity":2,
                  "price":50,
                  "currency":"USD",
                  "image_url":"http://petersapparel.parseapp.com/img/whiteshirt.png",
                  
                },
                {
                  "title":"Classic Gray T-Shirt",
                  "subtitle":"100% Soft and Luxurious Cotton",
                  "quantity":1,
                  "price":25,
                  "currency":"USD",
                  "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
                },

              ]
            }
          }
        }

        return messageData
}