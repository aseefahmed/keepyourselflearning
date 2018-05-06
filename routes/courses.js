var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/lms');
var flash = require('connect-flash');
var multer = require('multer');
var upload = multer({ dest: './public/img/courses/uploads' })

router.use(flash());

router.get('/admin/course/categories', function(req, res){
	var categories = db.get('course_categories');
	categories.find({},{}, function(err, categories){
		let data = { pageName: 'Course Categories', parentPageName: 'Courses', parentPageRoute:'/admin/courses', categories: categories }
		res.render('admin/courses/categories', data);
	})
	
});

router.get('/admin/course/category/add', function(req, res){
	let data = { pageName: 'New Category', parentPageName: 'Courses', parentPageRoute:'/admin/courses' }
	res.render('admin/courses/new_categories_form', data);
});

router.post('/admin/course/category/submit', upload.single('post_file'), function(req, res){

	req.checkBody('category_name', "Name is required").notEmpty();

	if(req.file){
	  	/*var random = Math.ceil(Math.random()*10000000000);
	  	filename = random+"_"+req.file.originalname;*/
	  	var mainimage = req.file.filename;
	  	var json = {
	  		name: req.body.category_name.toLowerCase(),
	  		image: mainimage,
			created_at: new Date(),
			no_of_programs: 0,
			updated_at: new Date()
	  	};

	  } else {
	  	var json = {
	  		name: req.body.category_name.toLowerCase(),
	  		image: "mainimage",
			no_of_programs: 0,
			created_at: new Date(),
			updated_at: new Date()
	  	};
	  }
	var errors = req.validationErrors();
	if(errors){
		res.send('err')
	}else{
		var categories = db.get('course_categories');
		categories.insert(json, function(err, categories){
			if(err){
				res.send('d1')
			}else{
				req.flash('success', 'Category Added');
				res.redirect('/admin/course/categories');
			}
		});
	}
});

router.get('/admin/courses', function(req, res){
	var courses = db.get('courses');
	courses.find({},{}, function(err, course){
		let data = { pageName: 'Courses', courses: course }
		res.render('admin/courses/courses_list', data);
	})
	
});

router.get('/admin/course/add', function(req, res){
	let categories = db.get('course_categories');
	categories.find({},{}, function(err, categories){
		let data = { 
			pageName: 'New Post', 
			parentPageName: 'Courses', 
			parentPageRoute: '/admin/courses',
			options: categories };
		res.render('admin/courses/new_course_form', data);
	});
	///let data = { pageName: 'New Post', session: req.session.passport.user };
	
});

router.post('/admin/course/update', upload.single('post_file'), function(req, res){

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
			price: req.body.price,
			short_description: req.body.short_description,
			description: req.body.description,
			image: mainimage,
			updated_at: new Date()
	  	};

	  } else {
	  	var json = {
	  		title: req.body.title,
			category: req.body.category,
			price: req.body.price,
			short_description: req.body.short_description,
			description: req.body.description,
			updated_at: new Date()
	  	};
	  }

	if(errors){
		res.send('no');
	}else{
		var course = db.get('courses');
		course.update({_id: req.body.course_id}, {$set: json});
		res.redirect('/admin/course/edit/'+req.body.course_id)
	}
	
});

router.get('/admin/course/edit/:id', function(req, res){

	let course = db.get('courses');
	course.find({_id: req.params.id}, {},function(err, course){
		let categories = db.get('course_categories');
		categories.find({},{}, function(err, categories){
				let data = { 
							pageName: 'Edit Details', 
							parentPageName: 'Courses', 
							parentPageRoute: '/admin/courses', 
							options: categories, 
							courses: course 
						};
				res.render('admin/courses/edit_course_form', data);
		});
	});
	
});

router.post('/admin/course/delete', function(req, res){

	var course = db.get('courses');
	course.remove({_id: req.body.deletable_course_id});
	res.redirect('/admin/courses');
});

router.post('/admin/course/submit', upload.single('post_file'), function(req, res){

	
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
		res.send('err');
	}else{
		var posts = db.get('courses');
		posts.insert({
			title: req.body.title,
			category: req.body.category,
			price: req.body.price,
			short_description: req.body.short_description,
			description: req.body.description,
			image: mainimage,
			created_at: new Date(),
			updated_at: new Date()

		}, function(err, post){

		
			if(err){
				res.send(err);
			}else{
				req.flash('success', 'Post Added');
				res.redirect('/admin/courses');
			}
		});
	}
});

module.exports = router;