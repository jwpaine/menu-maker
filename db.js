var mysql = require('mysql');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'takeout',
	password : '',
	database : 'takeout'
  });

exports.connect = function(conn) {
    console.log("connecting...")
    connection.connect(function(err) {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        conn(null);
        return
    }
    conn(connection);
    });
}
