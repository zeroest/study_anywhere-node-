
var mysql = require('mysql');
var config = require('../models/db_config');
var pool = mysql.createPool(config);


exports.hash = function (id, callback) {
	  pool.getConnection(function (err, conn) {
	    if (err) console.log('err', err);
	    var sql = 'select member_pw, member_email from member where member_id = ?';
	    conn.query(sql , [id], function (err, row) {
	      if (err) console.log('err', err);
	        callback(row[0]);
	        conn.release();
	      });
	    });
	  };






