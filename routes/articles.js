const express = require('express');
const router = express.Router();

//Bring in Article Model
let ArticleModel = require('../models/article');

//Add Route
router.get('/add', function(req, res){
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Add Submit POST Route
router.post('/add', function(req, res){
    let query = {title:req.body.title};
    console.log(query);
    //console.log(ArticleModel.find({title:req.body.title}).count());
    // ArticleModel.find({title:req.body.title}, function(err, article){
    //     if (article.title == req.body.title)
    //         {console.log(article);
    //         console.log(req.body.title);}
    //     else
    //     {console.log(article);
    //         console.log(req.body.title);}
    // });
    if(req.body.title == ''){
        req.flash('danger', 'Title is required');
        res.redirect('/articles/add');
    }
    else if(req.body.author == ''){
        req.flash('danger', 'Author is required');
        res.redirect('/articles/add');
    }
    else if(req.body.body == ''){
        req.flash('danger', 'Body is required');
        res.redirect('/articles/add');
    }
    else{ 
    let article = new ArticleModel();
    article.title = req.body.title;
    article.author = req.body.author;
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
router.get('/edit/:id', function(req, res){
    ArticleModel.findById(req.params.id, function(err, article){
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });  
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
    let query = {_id:req.params.id};

});

//Get Single Article
router.get('/:id', function(req, res){
    ArticleModel.findById(req.params.id, function(err, article){
        res.render('article', {
            article: article
        });  
    });
});

module.exports = router;