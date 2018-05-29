var db = require('./db.js');
var readline = require('readline');
var restaurant = require('./app/models/restaurant.js');
var customer = require('./app/models/customer.js');
var menu = require('./app/models/menu.js');

db.connect(function(connection) {
    if (connection != null) {
        console.log("connected to db")

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
          });
          
        rl.on('line', function(line){
            tokens = line.split(":");
            switch(tokens[0]) {
                case 'restaurant':
                    if (tokens[1] == "getall") {
                        console.log("Getting all restaurants")
                        restaurant.getAll(connection, function(cb) {
                            console.log(cb)
                            return;
                        })
                        break;
                    }
                    if (tokens[1] == "add") {
                        console.log("Adding new Restaurant")
                        restaurant.add(connection, tokens[2], function(cb) {
                            console.log(cb) // instead return new restaurant id
                            return;
                        });
                        break;
                    }
                    
                case 'menu':
                    if (tokens[1] == "add") {
                        console.log("Adding new item to menu")
                        restaurantId = tokens[2];
                        category = tokens[3];
                        item = tokens[4];
                        price = tokens[5];
                        menu.addItem(connection, restaurantId, category, item, price, function(cb) {
                            console.log(cb)
                            return;
                        }) 
                        break;
                    }

                    if (tokens[1] == "categories") {
                        restaurantId = tokens[2];
                        menu.getCategories(connection, restaurantId, function(cb) {
                            console.log(cb)
                            return;
                        })
                        break;
                    }

                    if (tokens[1] == 'items') {
                        category = tokens[3];
                        restaurantId = tokens[2];
                        menu.getItems(connection, restaurantId, category, function(cb) {
                            console.log(cb);
                            return;
                        })
                    }
                default:
                    console.log("invalid")
            }
        })
    }
})








 