var passport = require('passport')
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', message : "" });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', {session: true, failureFlash: true}, function(err, user, info) {
    console.log("user: " + JSON.stringify(user));
    console.log("info: " + JSON.stringify(info));

    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (! user) {
      return res.render('index', { title: 'Express', message : req.flash('loginMessage')});
    }
    return res.send({ success : true, message : 'authentication succeeded' });
  })(req, res, next);
});

module.exports = router;
