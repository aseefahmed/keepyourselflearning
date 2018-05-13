var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/lms');
var flash = require('connect-flash');
var multer = require('multer');
var upload = multer({ dest: './public/img/uploads' })
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

router.use(flash());

router.get('/dashboard', ensureLoggedIn,  function(req, res, next) {
  let posts = db.get('posts');
  let total_posts = posts.count({},{}, function(err,count_posts){

	  let categories = db.get('categories');
	  categories.count({},{},function(err,cout_categories){
	  	res.render('admin/dashboard', { 
		  	pageName: 'Home',
		  	totalPost: count_posts ,
		  	totalCategories: cout_categories
		  });
	  })
  });
  
});

/*function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
};
*/
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You are now logged out');
  	res.redirect('/login');
});

router.get('/posts', ensureLoggedIn, function(req, res){
	let posts = db.get('posts');
	
	posts.find({}, {sort:{updated_at:-1}}, function(err, posts){
		let data = { 
				pageName: 'Posts',  
				posts: posts }
		res.render('admin/posts', data);
	});
	
});

router.get('/categories', ensureLoggedIn, function(req, res){
	var categories = db.get('categories');
	categories.find({},{}, function(err, categories){
		let data = { pageName: 'Categories', categories: categories }
		res.render('admin/categories', data);
	})
	
});

router.get('/post/add', ensureLoggedIn,  function(req, res){
	let categories = db.get('categories');
	categories.find({},{}, function(err, categories){
		let data = { 
			pageName: 'New Post', 
				parentPageName: 'Posts', 
				parentPageRoute: '/posts',
			options: categories };
		res.render('admin/new_post_form', data);
	});
	///let data = { pageName: 'New Post', session: req.session.passport.user };
	
});

router.post('/comment/delete', ensureLoggedIn, function(req, res){
		
		let post = db.get('posts');
		post.update(
		  { _id: req.body.post_id },
		  { $pull: { comments: { id: req.body.deletable_comment_id } } },
		  { multi: true }
		);
		res.redirect('/post/edit/'+req.body.post_id);

		/*post.find({_id: req.body.post_id},{}, function(err, data){
			let new_data = data
			new_data.splice(req.body.deletable_post_id,1);
			
		})*/

		
});

router.get('/post/edit/:id', ensureLoggedIn, function(req, res){
	let posts = db.get('posts');
	posts.find({_id: req.params.id}, {},function(err, post){
		let categories = db.get('categories');
		categories.find({},{}, function(err, categories){
			posts.find({_id: req.params.id}, {}, function(err, post){
				let data = { 
							pageName: 'Edit Details', 
							parentPageName: 'Posts', 
							parentPageRoute: '/posts', 
							options: categories, 
							comments: post[0].comments,
							post: post 
						};
				res.render('admin/edit_post_form', data);
			})
		});
	});
	
});

router.post('/category/submit', ensureLoggedIn,  function(req, res){
	req.checkBody('category_name', "Name is required").notEmpty();
	var errors = req.validationErrors();
	if(errors){
		res.send('d')
	}else{
		var categories = db.get('categories');
		categories.insert({
			name: req.body.category_name.toLowerCase(),
			created_at: new Date(),
			updated_at: new Date()
		}, function(err, categories){
			if(err){
				res.send('d1')
			}else{
				req.flash('success', 'Category Added');
				res.redirect('/categories');
			}
		});
	}
});



router.post('/post/delete', ensureLoggedIn,  function(req, res){
	var posts = db.get('posts');
	posts.remove({_id: req.body.deletable_post_id});
	res.redirect('/posts');
});

router.post('/post/update', ensureLoggedIn, upload.single('post_file'), function(req, res){
	tags = req.body.input_tags[0].toLowerCase();
	// Form Validation
	req.checkBody('title','Title field is required').notEmpty();
	
	// Check Errors
	var errors = req.validationErrors();
	if(req.file){
	  	/*var random = Math.ceil(Math.random()*10000000000);
	  	filename = random+"_"+req.file.originalname;*/
	  	var mainimage = req.file.filename;
	  	var json = {
	  		title: req.body.title,
			category: req.body.category,
			short_description: req.body.short_description,
			external_link: req.body.external_link,
			external_author: req.body.external_author,
			description: req.body.description,
			tags: tags.split(','),
			image: mainimage,
			created_by: req.body.created_by,
			updated_at: new Date()
	  	};

	  } else {
	  	var json = {
	  		title: req.body.title,
			category: req.body.category,
			short_description: req.body.short_description,
			external_link: req.body.external_link,
			external_author: req.body.external_author,
			description: req.body.description,
			tags: tags.split(','),
			created_by: req.body.created_by,
			updated_at: new Date()
	  	};
	  }

	if(errors){
		res.send('no');
	}else{
		var post = db.get('posts');
		post.update({_id: req.body.post_id}, {$set: json});
		res.redirect('/post/edit/'+req.body.post_id)
	}
	
});

router.post('/post/submit', upload.single('post_file'), function(req, res){
	tags = req.body.input_tags[0].toLowerCase();
	// Check Image Upload
	  if(req.file){
	  	/*var random = Math.ceil(Math.random()*10000000000);
	  	filename = random+"_"+req.file.originalname;*/
	  	var mainimage = req.file.filename
	  } else {
	  	var mainimage = 'noimage.png';
	  }
	// Form Validation
	req.checkBody('title','Title field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();
	if(errors){

	}else{
		var posts = db.get('posts');
		posts.insert({
			title: req.body.title,
			category: req.body.category,
			short_description: req.body.short_description,
			external_link: req.body.external_link,
			external_author: req.body.external_author,
			description: req.body.description,
			tags: tags.split(','),
			image: mainimage,
			created_by: req.body.created_by,
			created_at: new Date(),
			updated_at: new Date()

		}, function(err, post){

		
			if(err){
				res.send(err);
			}else{
				req.flash('success', 'Post Added');
				res.redirect('/posts');
			}
		});
	}
});

router.get('/category/add', ensureLoggedIn, function(req, res){
	let data = { pageName: 'New Category' }
	res.render('admin/new_categories_form', data);
});

module.exports = router;
