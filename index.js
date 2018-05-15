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
const webpush = require('web-push');

var os = require('os')
var dotenv = require('dotenv');

var app = express();
app.locals.moment = require('moment');

var db = require('monk')('localhost/lms');

dotenv.load(); 
const port = process.env.PORT;
app.use(require('./routes/fronts'));
app.use(require('./routes/admin'));
app.use(require('./routes/chatio'));
app.use(require('./routes/courses'));

app.use(express.static(path.join(__dirname, 'public')));
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

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails('mailto:aseefahmed@gmail.com', publicVapidKey, privateVapidKey);

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
	console.log('listening on port '+port);
  
});

