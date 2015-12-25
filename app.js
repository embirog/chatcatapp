var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config = require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session)
	mongoose = require('mongoose').connect(config.dbURL),
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	rooms = []
	;

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

var env = process.env.NODE_ENV || 'development';



// note: cant update node_env, even updating the node env
if (env === 'development'){
	// dev specific settings
	//app.use(session({secret: 'catscanfly', saveUninitialized: true, resave:true}));

	//testing connect
	app.use(session({
		secret: config.sessionSecret,
		store: new ConnectMongo({
			//url:config.dbURL,
			mongooseConnection: mongoose.connection,
			stringify: true
		})
	}))
} else {
	// production specific settings
	app.use(session({
		secret: config.sessionSecret,
		store: new ConnectMongo({
			url:config.dbURL,
			stringify: true
		})
	}))
}

// var userSchema = mongoose.Schema({
// 	username:String,
// 	password:String,
// 	fullname:String
// })

// var Person = mongoose.model('users', userSchema);

// var Edmil = new Person({
// 	username: 'edmil',
// 	password: 'mypassword',
// 	fullname: 'edmilbirog'
// })

// Edmil.save((err) => {
// 	console.log('Done Save!!');
// });

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

require('./routes/routes.js')(express, app, passport, config, rooms);
//app.route('/').get((req, res, next) => {
	//res.send('<h1>Hello World</h1>');
//	res.render('index', { 'title' : 'Welcome to ChatCAT' });
//})

// app.listen(3000, () => {
// 	console.log('ChatCAT Working on port 3000');
// 	//console.log(process.env.NODE_ENV);
// 	console.log('Mode: ' + env);
// })

app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

require('./socket/socket.js')(io, rooms)
server.listen(app.get('port'), () => {
	console.log('ChatCAT on port : ' + app.get('port'));
})



