var moment = require('moment')

exports.add = function(connection, term, city, state, state_short, country, lat, lon, cb) {
    console.log("Saving location search")
    var sql = "INSERT INTO locationSearch (date, term, city, state, state_short, country, lat, lon) VALUES ?";
    date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    var values = [
      [date, term, city, state, state_short, country, lat, lon]
    ];
    connection.query(sql, [values], function (err, result) {
      if (err) {
        cb(err,null)
        return        
      } 
     
        cb(null, result);
  })
}