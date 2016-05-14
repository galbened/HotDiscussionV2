module.exports = function(passport, isLoggedIn, checkPermission){
    
    var express = require('express');
    var router = express.Router();

    /* ADMIN LOGIN */
    router.get('/login', function(req, res, next) {
      res.render('admin/login', { message: req.flash('loginMessage')});
    });

    router.post('/login', passport.authenticate('local-login',{
      successRedirect: '/admin/dashboard',
      failureRedirect: '/admin/login',
      failureFlash: true
      //session:true
    }));

    /* ADMIN LOGOUT */
    router.get('/logout', function(req, res){
      req.logout();
      res.redirect('/admin/login');
    });

    /* ADMIN DASHBOARD */
    router.get('/dashboard', isLoggedIn, checkPermission, function(req, res, next) {
      res.render('admin/adminDashboard', { });
    });

    //TODO: encrypt the passwords on database?

    /* ADMIN HOME PAGE, REDIRECT TO DASHBOARD IF LOGGED-IN */
    router.get('/', isLoggedIn, checkPermission, function(req, res, next) {
      res.redirect('/admin/dashboard');
    });

    return router;

};

