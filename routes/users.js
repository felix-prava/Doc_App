const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Bring in User Model
let UserModel = require('../models/user');

//Register Form
router.get('/register', function(req, res){
    res.render('register');
});

//Register Process
router.post('/register', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    if(req.body.name == ''){
        req.flash('danger', 'Name is required');
        res.redirect('/users/register');
    }
    else if(req.body.email == ''){
        req.flash('danger', 'Email is required');
        res.redirect('/users/register');
    }
    else if(req.body.username == ''){
        req.flash('danger', 'Username is required');
        res.redirect('/users/register');
    }
    else if(req.body.password == ''){
        req.flash('danger', 'Password is required');
        res.redirect('/users/register');
    } else{ 

        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('password2','Passwords do not match').equals(req.body.password);

        let errors = req.validationErrors();

        if(errors){
            res.render('register', {
                errors:errors
            });
        } else{
            let newUser = new UserModel({
                name: name,
                email: email,
                username: username,
                password: password
            });

            bcrypt.genSalt(10, function(err, salt){
                bcrypt.hash(newUser.password, salt, function(err, hash){
                    if (err){
                        console.log(err);
                    }
                    newUser.password = hash;
                    newUser.save(function(err){
                        if (err){
                            console.log(err);
                            return;
                        } else{
                            req.flash('success', 'You are now registered!');
                            res.redirect('/users/login');
                        }
                    });
                });
            });
        }
    }
});

//Login Form
router.get('/login', function(req, res){
    res.render('login');
});

//Login Process
router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'Logged Out');
    res.redirect('/users/login');
})

module.exports = router;