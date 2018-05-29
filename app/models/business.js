var moment = require('moment')

exports.add = function(connection, name, zip, category, owner, image, cb) {
    console.log("Adding new business")
    var sql = "INSERT INTO business (name, zip, category, image) VALUES ?";
    var values = [
      [name, zip, category, image]
    ];
    connection.query(sql, [values], function (err, result) {
      if (err) cb(err,null)
      // add grant for owner of new business
      sql = "INSERT INTO takeout.grants (grants.profileid, grants.businessid, grants.grant) VALUES ?";
      var values = [
        [owner, result.insertId, "owner"]
      ];
      connection.query(sql, [values], function (err, result) {
        if (err) cb(err,null)
        console.log("Updated Grants")
        cb(null, result);
    });
  })
}
exports.getAll = function(connection, cb) {
  var sql = 'SELECT * FROM business';
   connection.query(sql, function(err, rows, fields) {
       if (err) throw err;
       cb(rows)
   });
}
exports.search = function(connection, location, radius, cb) {
  console.log("Getting list of restaurants with " + radius + " miles of coordinates:" + location.lat + "," + location.lon)

 // var sql = 'SELECT * FROM business';

 var sql = "SELECT *, ROUND(( 3959 * acos( cos( radians( ? ) ) * cos( radians( lat ) ) " +
 "* cos( radians( lon ) - radians( ? ) ) + sin( radians( ? ) ) * sin(radians(lat)) ) ), 1) AS distance " +
"FROM takeout.business HAVING distance < ? ORDER BY distance";

   connection.query(sql, [location.lat, location.lon, location.lat, radius], function(err, rows, fields) {
       if (err) {
         cb (err, null)
         return
       }
       cb(null, rows)
   });
}
exports.info = function(connection, id, cb) {
  var sql = 'SELECT * FROM business where id = ?';
   connection.query(sql, [id], function(err, rows, fields) {
       if (err) {
         cb (err, null)
         return
       }
       console.log("business.js --> " + rows)
       cb(null, rows)
   });
}
exports.getToken = function(connection, endpoint, cb) {
  var sql = 'SELECT accessToken FROM business where id = ?';
  connection.query(sql, [endpoint], function(err, rows, fields) {
    if (err) {
      cb(err, null);
      return
    }
    cb(null, rows)
  });
}
exports.updateToken = function(connection, endpoint, token, cb) {
  var sql = 'UPDATE business SET accessToken = ? where id = ?';
  connection.query(sql, [token, endpoint], function(err, rows, fields) {
    if (err) {
      cb(err, null);
      return
    }
    cb(null, rows)
  });
}
