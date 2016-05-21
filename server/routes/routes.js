module.exports = function(app, passport, autoIncrement){
    
    authRouter = require('./auth')(passport);
    adminRouter = require('./admin')(passport, isLoggedIn("/admin/login"), checkPermission('admin'));
    restApiRouter = require('./api')(autoIncrement);
    discussionsRouter = require('./discussions')(isLoggedIn("/auth/login"));

    //authentication routing logic
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter);
    app.use('/api', restApiRouter);
    app.use('/discussions', discussionsRouter);


    //TODO - add a normal HOME PAGE, not just log-in or discussion dashboard
    app.get('/', isLoggedIn("/auth/login"), function(req, res, next) {
      res.redirect('/discussions');
    });

    

};

var isLoggedIn = function(loginRedirect){
  return function(req, res, next){
    if (req.isAuthenticated()){
      return next();
    }
    res.redirect(loginRedirect);
  };
};

var checkPermission = function(role){
  return function(req, res, next){
    if (req.user && req.user.local.role === role){
      next();
    }
    else{
      var event = new Date().toLocaleString();
      console.log(req.user.local.username + ' has entered unauthorized page without permition! ' + '[' + event + ']');
      req.logout();
      res.redirect('/auth/login');
    }
  };
};