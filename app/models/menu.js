var moment = require('moment');

exports.addItem = function(connection, businessId, category, item, description, price, image, option, asin, link, cb) {
    console.log("Adding item to menu")
      var sql = "INSERT INTO menu (businessId, category, item, description, price, image, option, asin, link, modified) VALUES ?";
      date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      var values = [
        [businessId, category, item, description, price, image, option, asin, link, date]
      ];
      console.log("Querying...")
      connection.query(sql, [values], function (err, result) {
        console.log("Queried")
        if (err) {
            cb(err, null)
            return
        }
        cb(null, result.affectedRows);
      });
}
exports.addCategory = function(connection, businessId, category, image, cb) {
    console.log("Adding item to menu")
      var sql = "INSERT INTO categories (businessid, category, image) VALUES ?";
     
      var values = [
        [businessId, category, image]
      ];
      console.log("Querying...")
      connection.query(sql, [values], function (err, result) {
        console.log("Queried")
        if (err) {
            cb(err, null)
            return
        }
        cb(null, result.affectedRows);
      });
}
exports.deleteCategory = function(connection, businessId, category, cb) {

     /* turn this into transaction that can be performed in a single query 
     in the event that either the first or second fails? */
      var sql = "DELETE FROM categories WHERE businessid = ? AND category = ?";
     
      connection.query(sql, [businessId, category], function (err, result) {
        console.log("Queried")
        if (err) {
            cb(err, null)
            return
        }
        sql = "DELETE FROM menu WHERE businessId = ? AND category = ?";
        connection.query(sql, [businessId, category], function (err, result) {
            console.log("Queried")
            if (err) {
                cb(err, null)
                return
            }
            cb(null, result.affectedRows);
          });
      });
}

exports.deleteItem = function(connection, businessId, item, cb) {
    
         /* turn this into transaction that can be performed in a single query 
         in the event that either the first or second fails? */
          var sql = "DELETE FROM menu WHERE businessId = ? AND item = ?";
         
          connection.query(sql, [businessId, item], function (err, result) {
            console.log("Queried")
            if (err) {
                cb(err, null)
                return
            }
                cb(null, result.affectedRows);
          });
    }


exports.getCategories = function(connection, businessId, cb) {
    console.log("Querying categories")
    var sql = 'SELECT category, image FROM categories WHERE businessId = ? AND sub IS NULL';
    connection.query(sql, [businessId], function(err, rows, fields) {
         if (err) {
             cb(err, null)
             return
         }
         cb(null, rows)
     });
}
exports.getSubCategories = function(connection, businessId, category, cb) {
    console.log("Querying categories")
    var sql = 'SELECT category, image FROM categories WHERE businessId = ? AND sub = ?';
    connection.query(sql, [businessId, category], function(err, rows, fields) {
         if (err) {
             cb(err, null)
             return
         }
         cb(null, rows)
     });
}
exports.getItems = function(connection, businessId, category, cb) {
    var sql = 'SELECT item, price, description, image, option FROM menu WHERE businessId = ? and category = ? ORDER BY price DESC';
    connection.query(sql, [businessId, category], function(err, rows, fields) {
         if (err) {
             cb(err, null)
         }
         cb(null, rows)
     });
}
// return options if they exist, under category containing non-option item */
exports.getOptions = function(connection, businessId, category, cb) {
    var sql = 'SELECT item, price, description, image FROM menu WHERE option = 1 and businessId = ? and category = ? ORDER BY price DESC';
    connection.query(sql, [businessId, category], function(err, rows, fields) {
         if (err) {
             cb(err, null)
         }
         cb(null, rows)
     });
}
exports.getMenu = function(connection, businessId, cb) {
  console.log("getting grants...")
  var sql = 'SELECT * FROM menu WHERE businessid = ? GROUP BY category;';
   connection.query(sql, [businessId], function(err, rows, fields) {
       if (err) {
           cb(err, null)
           return
       }
       cb(null, rows)
   });
}


