var express = require('express');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var flash = require('connect-flash');
var passport = require('passport');
var db = require('monk')('localhost/lms');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var dotenv = require('dotenv');
var User = require('../models/user');
var router = express.Router();


const Auth0Strategy = require('passport-auth0').Strategy;

/*const env = {
  AUTH0_CLIENT_ID: 'gq3E3762SZFm5a7EeJRhTGjQ8uR6x7PP',
  AUTH0_SECRET_KEY: 'G2qtiMFCWQA6Gg15vv-L6IJ7XHzeeqmb6PHyTHaOU96N0a6e5q3ba0Vn7eIOLDQ6',
  AUTH0_DOMAIN: 'keepyourselflearning.auth0.com',
  AUTH0_CALLBACK_URL: 'http://localhost:3000/callback'
};*/



dotenv.load(); 

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_SECRET_KEY,
    callbackURL: process.env.AUTH0_CALLBACK_URL
  },
  (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
  }
);

passport.use(strategy);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(validator())
router.use(flash());
router.use(session({ cookie: { maxAge: 60000 }, 
                  secret: 'woot',
                  resave: false, 
                  saveUninitialized: false}));
router.use(passport.initialize());
router.use(passport.session());


router.get('/', function(req, res){
	
	let course_categories = db.get('course_categories');

	course_categories.find({},{limit:6,sort:{created_at:1}},function(err,categories){

		let latest_posts = db.get('posts');
		latest_posts.find({},{limit:4, sort:{created_at:-1}},function(err,posts){
			let courses = db.get('courses');
			courses.find({},{limit:6}, function(err,c){
				var monthNames = [ "January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December" ];
				let data = {
					pageName: 'Index',
					months: monthNames,
					latest_posts: posts,
					categories: categories,
					courses: c
				};
				res.render("frontend/index", data);
			})
		})
	})
	
});

router.get('/public', function(req, res){
	res.send('done')
});

router.get('/private', function(req, res){
	res.send('denied');
})

router.get('/blog/:page?', function(req, res){

	let limit_data = 10;
	if(typeof req.params.page == 'undefined'){
		var page = 1;
		var offset_data = 0;
	}else{
		var offset_data = (req.params.page-1)*limit_data;
		var page = req.params.page;
	}

	let option = {
		limit:limit_data,
		skip: offset_data,
		sort: {created_at: -1}
	}

	let posts = db.get('posts');
		
	posts.find({}, option, function(err, posts){
		let recent_posts = db.get('posts');
		recent_posts.find({},{limit: 3, sort: {created_at: -1}}, function(err, recents){

			let categories = db.get('categories');
			categories.find({}, {}, function(err, categories){
				let popular_posts = db.get('posts');
				popular_posts.find({},{limit: 3, sort: {no_of_views: -1}},function(err, pop_posts){
					let post_count = db.get('posts');
					post_count.count({}, function(err,post_count){
						let data = {
							pageName: 'Blog', 
							posts: posts, 
							recents: recents,
							recents: recents,
							popular_posts: pop_posts,
							categories: categories,
							page_number: page,
							post_count: Math.ceil(post_count/limit_data)
						};
						res.render('frontend/blog', data);
					})
				});
			})


		})
		
	})
	
});

router.get('/search', function(req, res){
	let keyword =req.query.search;
	var pattern = '/'+keyword+'/';
	let posts = db.get('posts');
	//db.testlogwiki.find( { line_text: { $regex: result[, $options: 'i'] } } );

	posts.find({description: {$regex:pattern}}, {sort: {created_at: -1}}, function(err, posts){
		let recent_posts = db.get('posts');
		recent_posts.find({},{limit: 3, sort: {created_at: -1}}, function(err, recents){

			let categories = db.get('categories');
			categories.find({}, {}, function(err, categories){
				let popular_posts = db.get('posts');
				popular_posts.find({},{limit: 3, sort: {no_of_views: -1}},function(err, pop_posts){
					let data = {
							pageName: 'Blog', 
							posts: posts, 
							recents: recents,
							recents: recents,
							popular_posts: pop_posts,
							categories: categories
						};
					res.render('frontend/blog', data);
				});
			})


		})
		
	})
})
router.post('/comment/submit', function(req, res){
	var posts = db.get('posts');
	//posts.update({_id: req.body.post_id}, {$addToSet: {comments: {$each: [req.body.msg]}}});
	let comment_id = Math.random().toString(36).substr(2, 9);

	posts.update(
				 { _id: req.body.post_id },
				 { $addToSet: { comments: { $each: [ {id: comment_id, name: req.body.name, email: req.body.email, website: req.body.website, message: req.body.msg, date: new Date()} ] } } }
				);
	res.send(req.body)
});

router.get('/blog/category/:category', function(req, res){
	let posts = db.get('posts');

	posts.find({category: req.params.category}, {sort: {created_at: -1}}, function(err, posts){
		let recent_posts = db.get('posts');
		recent_posts.find({},{limit: 3, sort: {created_at: -1}}, function(err, recents){

			let categories = db.get('categories');
			categories.find({}, {}, function(err, categories){
				let popular_posts = db.get('posts');
				popular_posts.find({},{limit: 3, sort: {no_of_views: -1}},function(err, pop_posts){
					let data = {
							pageName: 'Blog', 
							posts: posts, 
							recents: recents,
							categories: categories,
							popular_posts: pop_posts
						};
				res.render('frontend/blog', data);
				});
				
			})


		})
		
	})
})

router.get('/blog/tag/:tag', function(req, res){
	let posts = db.get('posts');

	posts.find({tags: req.params.tag}, {sort: {created_at: -1}}, function(err, posts){
		let recent_posts = db.get('posts');
		recent_posts.find({},{limit: 3, sort: {created_at: -1}}, function(err, recents){

			let categories = db.get('categories');
			categories.find({}, {}, function(err, categories){
				let popular_posts = db.get('posts');
				popular_posts.find({},{limit: 3, sort: {no_of_views: -1}},function(err, pop_posts){
					let data = {
							pageName: 'Blog', 
							posts: posts, 
							recents: recents,
							categories: categories,
							popular_posts: pop_posts
						};
					res.render('frontend/blog', data);
				});
			})


		})
		
	})
})

router.get('/post/get/:id', function(req, res){
	let posts = db.get('posts');
	
	posts.find({_id: req.params.id}, {},function(err, post){
		let recent_posts = db.get('posts');	
		recent_posts.find({},{limit: 3, sort: {created_at: -1}}, function(err, recents){
			let categories = db.get('categories');
			categories.find({}, {}, function(err, categories){
				if(typeof post[0].no_of_views != "number"){
					views = 0;
				}else {
					views = post[0].no_of_views;
				}
				posts.update({_id: req.params.id}, {$set: {no_of_views: views+1}});
				let popular_posts = db.get('posts');
				popular_posts.find({},{limit: 3, sort: {no_of_views: -1}},function(err, pop_posts){
					let data = {
							pageName: 'Details', 
							parentPageName: 'Blog', 
							ParentPageRoute: '/blog', 
							details: post, 
							recents: recents,
							popular_posts: pop_posts,
							categories: categories
						};
						res.render('frontend/post_details', data);
				});
			})
		})
		
	});
	
});

router.get('/courses/:category?', function(req, res){
	if(typeof req.params.category == 'undefined'){
		var filter = {}
	}else{
		var filter = {category:req.params.category}
	}
	let courses = db.get('courses');
	
	courses.find(filter,{},function(err,course){
		let categories = db.get('course_categories');
		categories.find({},{},function(err,cat){
			let data = {
			pageName: 'Courses',
			courses: course,
			categories: cat
		};
		res.render('frontend/courses', data);	
		})
	})
});

router.get('/grid/courses/:category?', function(req, res){
	if(typeof req.params.category == 'undefined'){
		var filter = {}
	}else{
		var filter = {category:req.params.category}
	}
	let courses = db.get('courses');
	
	courses.find(filter,{},function(err,course){
		let categories = db.get('course_categories');
		categories.find({},{},function(err,cat){
			let data = {
			pageName: 'Courses',
			courses: course,
			categories: cat
		};
		res.render('frontend/grid_courses', data);	
		})
	})
	
});

router.get('/login1', function(req, res){
	let data = {pageName: 'Login'};
	res.render('frontend/login', data);
});

router.get(
  '/login',
  passport.authenticate('auth0', {
    clientID: process.env.AUTH0_CLIENT_ID,
    domain: process.env.AUTH0_DOMAIN,
    redirectUri: process.env.AUTH0_CALLBACK_URL,
    audience: 'https://' + process.env.AUTH0_DOMAIN + '/userinfo',
    responseType: 'code',
    scope: 'openid profile'
  }),
  function(req, res) {
    res.redirect('/');
  }
);



// Perform session logout and redirect to homepage
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get(
  '/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/no'
  }),
  function(req, res) {
  	res.send(profile)
    res.redirect(req.session.returnTo ||'/dashboard');
  }
);


router.get('/register', function(req, res){
	let data = {pageName: 'Register'};
	res.render('frontend/register', data);
});

router.get('/ ntact', function(req, res){
	let data = {pageName: 'Contact'};
	res.render('frontend/contact', data);
});

router.get('/faq', function(req, res){
	let data = {pageName: 'FAQ'};
	res.render('frontend/faq', data);
});

router.post('/register', function(req, res){
	var newUser = new User({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		username: req.body.email,
		password: req.body.password,
		role: '2',
		created_at: new Date(),
		updated_at: new Date(),
	});	

	User.createUser(newUser, function(err, user){
		if(err)
			throw err;
		else{
			res.send('1');
		}
	});
});



/*router.post('/login',
  passport.authenticate('local',{failureRedirect:'/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/dashboard');
});*/



// you can use this section to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));
module.exports = router