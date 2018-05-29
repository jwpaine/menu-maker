var moment = require('moment')

exports.find = function(connection, profileid, cb) {
    console.log("Finding Webuser...")
    var sql = 'SELECT * FROM webusers WHERE profileid = ?';
     connection.query(sql, [profileid], function(err, rows, fields) {
         if (err) {
             cb(err, null)
             return
         }
         cb(null, rows)
     });
}
exports.add = function(connection, firstname, lastname, profileid, gender, email, token, cb) {
    var sql = "INSERT INTO webusers (firstname, lastname, profileid, gender, email, token, created, lastlogin) VALUES ?";
    date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    var values = [
      [firstname,lastname,profileid,gender,email,token, date, date]
    ];
    connection.query(sql, [values], function (err, result) {
      if (err) {
         cb(err, null)
         return;
      }
      cb(null, result);
    });
}
exports.updateLastLogin = function(connection, profileid, cb) {
    var sql = "UPDATE webusers SET lastlogin=? where profileid=?";
    date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    
    connection.query(sql, [date, profileid], function (err, result) {
      if (err) {
         cb(err, null)
         return;
      }
      cb(null, result);
    });
}


exports.grants = function(connection, profileid, cb) {
        console.log("getting grants...")
        var sql = 'SELECT t1.id, t1.name, t1.image, t2.grant FROM business as t1 INNER JOIN grants as t2 ON t2.businessid=t1.id WHERE t2.profileid = ?;';
         connection.query(sql, [profileid], function(err, rows, fields) {
             if (err) {
                 cb(err, null)
                 return
             }
             cb(null, rows)
         });
}
// return 1 if user has a grant for business id
exports.grant = function(connection, profileid, businessid, cb) {
    console.log("getting grants...")
    var sql = 'SELECT 1 from grants where profileid = ? and businessid = ?';
     connection.query(sql, [profileid, businessid], function(err, rows, fields) {
         if (err) {
             cb(err, null)
             return
         }
         if (rows.length == 1) {
            cb(null, true)
            return
         }
         cb(null, false)
     });
}