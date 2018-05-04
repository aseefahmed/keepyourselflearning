var express = require('express');
var router = express.Router();

router.get('/chat', function(req, res){
	res.render('frontend/chat', {
		pageTitle: 'Chat',
		pageName: 'Chat',
		pageID: 'Chat'
	});
})

module.exports = router;