var passport = require('passport')
var express = require('express');
var router = express.Router();

/*로그인 유저 판단 로직*/
var checkAuthentication = function (req, res, next) {
  if(req.isAuthenticated()){
    next();
  } else{
    res.render('index', { title: 'Express', message : 'Login first.' });
  }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', message : "" });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', {session: true, failureFlash: true}, function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (! user) {
      return res.render('index', { title: 'Express', message : req.flash('loginMessage')});
    }

    req.login(user, function(error) {
      if (error) return next(error);
      res.redirect('/myinfo');
    });
  })(req, res, next);
});

router.get('/myinfo', checkAuthentication, function (req, res) {
  sess = req.session.passport.user;
  return res.render('myinfo', { title: 'My Info', session: sess });
});

module.exports = router;
