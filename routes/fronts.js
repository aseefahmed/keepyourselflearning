var express = require('express');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var flash = require('connect-flash');
var passport = require('passport');
var db = require('monk')('localhost/lms');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var User = require('../models/user');
var router = express.Router();

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
	
	/*let a = db.get('course_categories');
	a.remove({})*/
	let course_categories = db.get('course_categories');

	course_categories.find({},{limit:6,sort:{created_at:1}},function(err,categories){

		let data = {
			pageName: 'Index',
			categories: categories
		};
		res.render("frontend/index", data);
	})
	
});

router.get('/blog', function(req, res){
	let posts = db.get('posts');

	posts.find({}, {sort: {created_at: -1}}, function(err, posts){
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

router.get('/courses', function(req, res){
	let data = {pageName: 'Courses'};
	res.render('frontend/courses', data);
});

router.get('/login', function(req, res){
	let data = {pageName: 'Login'};
	res.render('frontend/login', data);
});

router.get('/register', function(req, res){
	let data = {pageName: 'Register'};
	res.render('frontend/register', data);
});

router.get('/contact', function(req, res){
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


router.post('/login',
  passport.authenticate('local',{failureRedirect:'/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/dashboard');
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
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