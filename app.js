var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer = require('multer');
var moment = require('moment');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var mongo = require('mongodb');
var dotenv = require('dotenv').load();
var compression = require('compression'); 
var compressor = require('node-minify');




/*passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});*/

app.use(passport.initialize());
app.use(passport.session());

var app = express();
app.locals.moment = require('moment');

var db = require('monk')('localhost/lms');

const port = 10007;
app.use(require('./routes/fronts'));
app.use(require('./routes/admin'));

app.use(compression());
app.use(minify({
  cache: false,
  uglifyJsModule: null,
  errorHandler: null,
  jsMatch: /js/,
  cssMatch: /css/
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());  
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));





app.use(flash());
/*app.use(function(req, res, next){
	req.locals.message = require('express-message')(req, res);
	next();
});*/
app.use(function(req, res, next){
	req.db = db;
	next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

var server = app.listen(port, function(){
	console.log('listening on port '+port)
});

