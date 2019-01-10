var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var ejs = require('ejs');

//========================================================================================

var db_room = require('../models/db_room');

var router = express.Router();

router.use(session({
	 secret: 'study_anywhere',
	 resave: false,
	 saveUninitialized: true
}));

//========================================================================================

var userrooms = [];





/*router.get('/roomList', function(req,res){
	//var currentRoom = Object.keys(io.sockets.adapter.rooms).filter(item => item!=io.sockets.id);
	db_room.getList(userrooms, function(row){
		console.log("in/room : "+row);
		userrooms = row;
		res.send(userrooms);
	});	
	//res.redirect('/roomList/1')
});*/


router.get('/roomList/:num', function(req,res){
	//var currentRoom = Object.keys(io.sockets.adapter.rooms).filter(item => item!=io.sockets.id);
	db_room.getList(userrooms, function(row){
		console.log("in/room : "+row);
		userrooms = row;
		//res.send(userrooms);
		

		var pageNum = req.params.num;     
		var size = 5;  // 한 페이지에 보여줄 개수
		var begin = (pageNum-1)*size;
		var cnt = userrooms.length;  // 전체 글의 개수
		var totalPage = Math.ceil(cnt / size);  // 전체 페이지의 수
		var pageSize = 3; // 페이지 링크의 개수   
		    
		var startPage = Math.floor((pageNum-1)  / pageSize) * pageSize + 1;
		var endPage = startPage + (pageSize - 1);
		if(endPage > totalPage) {
		    endPage = totalPage;
		}
		
/*	      var size = 10;  // 한 페이지에 보여줄 개수
	      var begin = (page - 1) * size; // 시작 글
	      var cnt = rows[0].cnt;  // 전체 글의 개수
	      var totalPage = Math.ceil(cnt / size);  // 전체 페이지의 수 (75 / 10 = 7.5(X) -> 8(O))
	      var pageSize = 10; // 페이지 링크의 개수

	      // 1~10페이지는 1로, 11~20페이지는 11로 시작되어야하기 때문에 숫자 첫째자리의 수를 고정시키기 위한 계산법
	      var startPage = Math.floor((page-1)  / pageSize) * pageSize + 1;
	      var endPage = startPage + (pageSize - 1);

	      if(endPage > totalPage) {
	        endPage = totalPage;
	      }*/
		
		var data = {
			"userrooms": row,
			"pageNum": pageNum,
			"size": size,
			"begin": begin,
			"cnt": cnt,
			"totalPage": totalPage,
			"pageSize": pageSize,
			"startPage": startPage,
			"endPage": endPage
		}
		
		console.log(data);
		console.log(data.userrooms[0]);
		//res.render('lobby.ejs',{ "data" : data });
		res.send(data);
		
	});
	
});

router.post('/roomCheck', function(req,res){
	var rname = req.body.rname;
	var rpass = req.body.rpass;
	console.log(rname);
	console.log(rpass);
	
	db_room.roomCheck(rname, function(row){
		if(row.roompass == rpass){
			console.log('비번 맞음')
			res.render('room/roomJoin',{ "roomname": rname });
		}else{
			res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
			res.end('<script>alert("비밀번호가 일치하지 않습니다"); window.location="http://localhost:3000/";</script>')
		}
	})
});


router.get('/existCheck', function(req,res){

	var roomname = req.query.roomname;
	console.log("roomname : "+roomname);

	db_room.existCheck(roomname, function(result){
		console.log("result"+result);
			var out = '';
			out += '{ \"result\": '; 
			if(!result){
				out+= '\"yes\"';
			}else{
				out+= '\"no\"';
			}
			out+= ' }';
			console.log(out);
		res.end(out);
		
	})

})

router.get('/searchRoom', function(req,res){
	
	var searchText = req.query.searchText;
	console.log(searchText);
	
	db_room.search(searchText, function(result){
		console.log(result);
		
		res.send(result);
		
	});
	
	
});


//========================================================================================

module.exports = router;

