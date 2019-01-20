//모듈 추가
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var express = require('express');
var socketio = require('socket.io');
var session = require('express-session');
var bodyParser = require('body-parser');

//========================================================================================

//웹 서버와 소켓 서버를 생성
var app = express();
io = socketio();
var server = require('http').createServer(app);
//소켓 서버를 웹 서버에 연결
io.attach(server);

//서버 실행
var port = 3000;
server.listen(port, function(){
	console.log('server running at http://localhost:'+port);
});

//========================================================================================

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//라우터 추가
var indexRouter = require('./routes/index');
var lobbyRouter = require('./routes/lobby');
var roomRouter = require('./routes/room');

var db_room = require('./models/db_room');
var db_member = require('./models/db_member');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	key: 'sid',
	 secret: 'study_anywhere',
	 resave: false,
	 saveUninitialized: true,
	 cookie: {
		    maxAge: 24000 * 60 * 60 // 쿠키 유효기간 24시간
		  }
}));


app.use('/', indexRouter);
app.use('/lobby', lobbyRouter);
app.use('/room', roomRouter)


//========================================================================================

var usernames = [];

io.sockets.on('connect', function(socket){
	var roomId = "";
	
/*	var userroom = {
			userid: string,
			roomname: string,
			roompass: string,
			roommaxp: int,
			roomcurp: int
	}*/
	
	socket.on('guestjoin', function(data){		
		var username = data.username;
		var roomname = data.roomname;
		socket.username = username;
		socket.room = roomname;
		//usernames[username] = username;
		
		db_member.addchatlist(data,function(result){
			
			//console.log(result);
			
			socket.join(data.roomname);
			socket.emit('servernoti', 'green', 'you has connected Chat');
			
			/*var userlist = new Array();	
			
			for (var name in usernames) {
				userlist.push(usernames[name]);
			}*/
			
			db_member.getchatlist(roomname ,function(data){
				var list = [];
		          for(var i = 0; i<data.length; i++){
		            list.push(data[i].member_id);
		          }
		          console.log(list);
		          io.sockets.in(roomname).emit('updateuser', list);
		          socket.broadcast.to(roomname).emit('servernoti', 'green', username + ' has connected to ' + roomname);		
			})
		})
			
	});	
	
	socket.on('join', function(data){
		console.log('data at join : '+data);
		
		db_room.getList(data, function(row){
			userrooms = row;
			var result = 0;
			
			function wheretogo(){
				for(var item in userrooms){
					if(userrooms[item].roomname == data){
						result+=1;
					}
				}
			}
			
			if(result != 1){
				
				roomId = data;
				//socket.leave(socket.room);
				//socket.join(data);
				socket.room = data;
						
						
				var destination = 'http://localhost:3000/room';
				var redirect ={
					"bool": true,
					"method": "POST",
					"destination": destination
				}
				socket.emit('redirect', redirect);
				
			}else{
				
				console.log('오류발생 ');
				
				var destination = 'http://localhost:3000';
				var redirect ={
						"bool": false,
						"method": "GET",
						"destination": destination
				}
				socket.emit('redirect', redirect);
				
			}
			
		});
		
	});
	

	
	
	socket.on('onCreateRoom', function(data){
		console.log('on server onCreateRoom')
		
		
		
		var roomexist = false;
/*		for(var item in userrooms){
			if(data.roomname == userrooms[item].roomname){
				roomexist = true;
			}
		}*/
		
		db_room.existCheck(data.roomname, function(result){
			roomexist = result;
		
			if(!roomexist){
				//socket.leave(socket.room);
				//socket.join(data.roomname);
				socket.room = data.roomname;
				data.rcode = 0;
				
				var room = {
						userid: data.userid,
						roomname: data.roomname,
						roompass: data.roompass,
					};
				
				db_room.createRoom(room, function(row){
					console.log(row);
				});
				
			}else{
				data.rcode = 1;
			}
			
			if(data.rcode == 0){
			socket.emit('onCreateRoom', data)
			}else{
				console.log('기존 방있음');
			}
		})
	});
	
	
	
	socket.on('sendmsg', function (data) {
		console.log(data.message);
		console.log(data.mem_ID);
		io.sockets.in(socket.room).emit('recvmsg', data.mem_ID, data.message);
	});
	
	
	
	socket.on('disconnect', function(){
		//delete usernames[socket.username];
		console.log(socket.username+"disconnect")
		
		var username = socket.username;
		var roomname = socket.room;

		db_member.delchatlist(username, function(){
			
			db_member.getchatlist(roomname, function(list){
				
		          io.sockets.emit('updateuser', list);
		          if(typeof(socket.username) != 'undefined' && username != ''){
						socket.broadcast.to(roomname).emit('servernoti', 'red', socket.username + ' has disconnected');
					}
					socket.leave(socket.room);
					
			})
			
		});
		
			
	}); //disconnect
	
	socket.on('draw', function(data){
		io.sockets.in(socket.room).emit('line', data);
	});
	
	socket.on('clearAll', (data) => {
		io.sockets.in(socket.room).emit('clearAll', data);
	});
	
	socket.on('joinCanvas', function(data){
		socket.join(data);
		socket.room = data;
		
		io.sockets.in(data).emit('getImage', "");
		socket.on('getImage', (data) => {
			console.log('image save..........')
			io.sockets.in(data).emit('setImage', data);
		});
		
	});
	
	
}) // socket end









//========================================================================================

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//========================================================================================


//module.exports = app;
