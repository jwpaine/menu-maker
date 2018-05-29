var moment = require('moment')

exports.addItem = function(connection, businessid, customerid, ordercookieid, item, cb) {
   
    console.log("Adding item to customer order")
    var sql = "INSERT INTO orders (customerid, ordercookie, date, businessid, item, price) SELECT ?, ?, ?, businessId, item, price FROM menu WHERE businessId = ? and item = ?";

      date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      console.log("Querying...")
      connection.query(sql, [customerid, ordercookieid, date, businessid, item], function (err, result) {
        console.log("Queried")
        if (err) {
            cb(err, null)
            return
        }
        cb(null, result.affectedRows);
      });
}

exports.get = function(connection, ordercookie, customerid, cb) {

  if (customerid) {
    var sql = 'SELECT t1.id, t1.item, t1.price, t2.image FROM orders as t1 INNER JOIN menu as t2 ON t2.item=t1.item WHERE customerid = ?;';
    connection.query(sql, [customerid], function(err, rows, fields) {
         if (err) {
             cb(err, null)
         }
         cb(null, rows)
     });
     return
  }
  // else just get by cookie
  var sql = 'SELECT t1.id, t1.item, t1.price, t2.image FROM orders as t1 INNER JOIN menu as t2 ON t2.item=t1.item WHERE ordercookie = ?;';
  connection.query(sql, [ordercookie], function(err, rows, fields) {
       if (err) {
           cb(err, null)
       }
       cb(null, rows)
   });



}
exports.removeItem = function(connection, id, ordercookie, cb) {
    var sql = "DELETE FROM orders WHERE id = ? AND ordercookie = ?"
  connection.query(sql, [id, ordercookie], function(err, rows, fields) {
       if (err) {
           cb(err, null)
           return
       }
     
       cb(null, rows)
   });
}
