module.exports = function(passport){

    var express = require('express');
    var router = express.Router();

    /* USER LOGIN */
    router.get('/login', function(req, res, next) {
        res.render('login', { message: req.flash('loginMessage')});
    });

    // router.post('/login', passport.authenticate('local-login',{
    //   successRedirect: '/discussions',
    //   failureRedirect: '/auth/login',
    //   failureFlash: true
    //   //session:true
    // }));
    router.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            console.log(info);
            if (err) {
                return next(err);
            }
            if (!user) {
                res.send(info);
            }
            else{
                if (!user.local.role){
                    user.local.role = req.body.role;
                }
                req.login(user, req.session, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.send({
                        message: 'logged-in'
                    });
                });
            }
        })(req, res, next);
    });

    /* USER LOGOUT */
    router.get('/logout', function(req, res){
        req.logout();
        res.redirect('/auth/login');
    });

    /* USER REGISTRATION */
    router.get('/register', function(req, res, next) {
        res.render('register', { message: req.flash('registerMessage')});
    });

    router.post('/register', passport.authenticate('local-register', {
        successRedirect: '/auth/login',
        failureRedirect: '/auth/register',
        failureFlash: true
        //session:true
    }));


    /* RESET PASSWORD */
    router.get('/resetMail', function(req, res, next) {
        res.render('resetMail', { message: req.flash('mailMessage')});
    });

    router.post('/resetMail', passport.authenticate('send-mail',{
            successRedirect: '/auth/resetPass',
            failureRedirect: '/auth/resetMail',
            failureFlash: true
            //session:true
    }));


    /* RESET PASSWORD */
    router.get('/resetPass', function(req, res, next) {
        res.render('resetPass', { message: req.flash('passwordMessage')});
    });

    router.post('/resetPass', passport.authenticate('change-password',{
        successRedirect: '/auth/login',
        failureRedirect: '/auth/resetPass',
        failureFlash: true
        //session:true
    }));

    /* RESET PASSWORD */
    router.get('/resetMail', function(req, res, next) {
        res.render('resetMail', { message: req.flash('registerMessage')});
    });

    router.post('/resetMail', passport.authenticate('send-mail',{
        successRedirect: '/auth/resetPass',
        failureRedirect: '/auth/resetMail',
        failureFlash: true
        //session:true
    }));



    return router;


//TODO: encrypt the passwords on database?
};