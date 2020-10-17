const express = require('express');
const { ready } = require('jquery');
const router = express.Router();

//Bring in Article Model
let ArticleModel = require('../models/article');
//Bring in User Model
let UserModel = require('../models/user');

//Add Route
router.get('/add', ensureAuthenticated, function(req, res){
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Add Submit POST Route
router.post('/add', function(req, res){
    let query = {title:req.body.title};
    console.log(query);
    if(req.body.title == ''){
        req.flash('danger', 'Title is required');
        res.redirect('/articles/add');
    }
    else if(req.body.body == ''){
        req.flash('danger', 'Body is required');
        res.redirect('/articles/add');
    }
    else{ 
    let article = new ArticleModel();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err){
        if (err){
            console.log(err);
            return;
        } else{
            req.flash('success', 'Article Added');
            res.redirect('/');
        }
    });
    }
});

//Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
    ArticleModel.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/articles/'+ req.params.id);
        } else{
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            }); 
        }; 
    });
});

//Update Submit POST Route
router.post('/edit/:id', function(req, res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id};

    ArticleModel.updateOne(query, article, function(err){
        if (err){
            console.log(err);
            return;
        } else{
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

//Delete Article
router.delete('/:id', function(req, res){
    if (!ready.user._id){
        res.status(500).send();
    }
    let query = {_id:req.params.id};

    ArticleModel.findById(req.params._id, function(err, article){
        if(article.author != req.user._id){
            res.status(500).send();
        } else{
            //Delete
        }
    });
});

//Get Single Article
router.get('/:id', function(req, res){
    ArticleModel.findById(req.params.id, function(err, article){
        UserModel.findById(article.author, function(err, user){
            res.render('article', {
                article: article,
                author: user.name
            }); 
        });
    });
});

//Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else{
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;