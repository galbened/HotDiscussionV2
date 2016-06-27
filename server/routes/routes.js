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

module.exports = function(app, passport, autoIncrement, io){
    
    /*
     *  Server Routing
     */
    var authRouter = require('./auth')(passport);
    var adminRouter = require('./admin')(passport, isLoggedIn("/admin/login"), checkPermission('admin'));
    var discussionsRouter = require('./discussions')(isLoggedIn("/auth/login"));
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter);
    app.use('/discussions', discussionsRouter);
    /*
     *  Server API
     */
    var restApiRouter = require('./api')(autoIncrement, io);
    app.use('/api', restApiRouter);    

    //TODO: add a normal HOME PAGE, not just log-in or discussion dashboard
    app.get('/', isLoggedIn("/auth/login"), function(req, res, next) {
      res.redirect('/discussions');
    });

    app.get('*', isLoggedIn("/auth/login"), function(req, res, next) {
      res.redirect('/discussions');
    });
};