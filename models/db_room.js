var mysql = require('mysql');
var config = require('../models/db_config');
var pool = mysql.createPool(config);

exports.createRoom = function(data, callback) {
	pool
			.getConnection(function(err, conn) {
				if (err)
					console.log('err', err);
				var sql = 'insert into room(room_name, room_pass, user_id) values( ? , ? , ? );';
				conn.query(sql, [ data.roomname, data.roompass, data.userid ],
						function(err, result) {
							if (err)
								console.log('err', err);
							console.log(result);

							var success = false;

							if (result.affectedRows == 1) {
								success = true;
							}
							conn.release();
							// 요청한 곳에 callback함수를 돌려준다.
							callback(success);

						});
			});
};

exports.existCheck = function(data, callback) {
	pool.getConnection(function(err, conn) {
		if (err)
			console.log('err', err);
		var sql = 'select room_name from room where room_name=?';
		conn.query(sql, [ data.roomname ], function(err, row) {
			if (err)
				console.log('err', err);
			console.log(row);

			var success = false;

			if (row.affectedRows == 1) {
				success = true;
			}
			conn.release();
			// 요청한 곳에 callback함수를 돌려준다.
			callback(success);

		});
	});
};

exports.getList = function(data, callback) {
	pool.getConnection(function(err, conn) {
		if (err)
			console.log('err', err);
		var sql = 'select * from room;';
		conn.query(sql, function(err, result) {
			if (err)
				console.log('err', err);
			console.log("in getList: " + result);

			callback(result);
			conn.release();

		});
	});
};

exports.roomCheck = function(data, callback) {
	pool.getConnection(function(err, conn) {
		if (err) console.log('err', err);
		var sql = 'select room_pass from room where room_name= ?;';
		conn.query(sql, data , function(err, result) {
			if (err) console.log('err', err);
			console.log(result[0].room_pass);

			callback(result[0].room_pass);
			conn.release();

		});
	});
};
