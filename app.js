
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');



var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app)
  ,  io = require('socket.io').listen(server);	

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on( 'connection', function ( socket ) {

    socket.on('set nickname', function (nickname) {
        // Save a variable 'nickname'
        socket.set('nickname', nickname, function () {
            var connected_msg = nickname + ' is now connected.';
            console.log(connected_msg);
            io.sockets.volatile.emit('broadcast_msg', connected_msg)
        });
    });

    socket.on('emit_msg', function (msg) {
        // Get the variable 'nickname'
        socket.get('nickname', function (err, nickname) {
            console.log('Chat message by', nickname);
            io.sockets.volatile.emit( 'broadcast_msg' , nickname + ': ' + msg );
        });
    });
    socket.on('board_changed', function(new_text) {
        console.log('board chage deteted');
        io.sockets.volatile.emit('write_on_board', new_text);
    });
});
