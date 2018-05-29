var moment = require('moment')

exports.find = function(connection, facebookId, cb) {
    var sql = 'SELECT * FROM customers WHERE facebookId = ?';
     connection.query(sql, [facebookId], function(err, rows, fields) {
         if (err) throw err;
      /*   for (var i in rows) {
             console.log(rows[i]);
         }
       */
         cb(rows)
     });
}
exports.add = function(connection, facebookId, cb) {
    var sql = "INSERT INTO customers (facebookId, created, lastMessaged) VALUES ?";
    date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    var values = [
      [facebookId, date, date]
    ];
    connection.query(sql, [values], function (err, result) {
      if (err) cb(err)
      cb(result.affectedRows);
    });
}
exports.updateLastMessaged = function(connection, facebookId, cb) {
    date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    connection.query("UPDATE customers SET lastMessaged = ? WHERE facebookId = ?", [date, facebookId], function (error, results, fields) {
        if (error) {
          cb(err, null)
        } else {
            cb(null, "success")
        }
      });

}