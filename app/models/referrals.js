var moment = require('moment')

exports.add = function(connection, name, address, phone, email, searchcookie, cb) {

  
    console.log("Adding referal to database")
    date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    if (searchcookie != undefined) {
      sql = "INSERT INTO referrals (name, address, phone, email, date, lat, lon) VALUES ?";
      values = [
        [name, address, phone, email, date, searchcookie.lat, searchcookie.lon]
      ];
    } else {
      sql = "INSERT INTO referrals (name, address, phone, email, date) VALUES ?";
      values = [
        [name, address, phone, email, date]
      ];
    }
    
      connection.query(sql, [values], function (err, result) {
        console.log("Queried")
        if (err) {
            cb(err, null)
            return
        }
        cb(null, result.affectedRows);
      });
}