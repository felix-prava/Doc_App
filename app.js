const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/docapp', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

//Check connection
db.once('open', function(){
    console.log('Connected to MongoDB');
});

//Check for DB errors
db.on('error', function(err){
    console.log(err);
});

//Init app
const app = express();

//Bring in Models
let ArticleModel = require('./models/article');

//Load View Engine
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware

app.use(bodyParser.urlencoded({extended: false}))
//Parse application/json
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg : msg,
            value : value
        };
    }
}));

//Home Route
app.get('/', function(req, res){
    ArticleModel.find({}, function(err, articles){
        if (err){
            console.log(err);
        } else{
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

//Get Single Article
app.get('/article/:id', function(req, res){
    ArticleModel.findById(req.params.id, function(err, article){
        res.render('article', {
            article: article
        });  
    });
});

//Add Route
app.get('/articles/add', function(req, res){
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Add Submit POST Route
app.post('/articles/add', function(req, res){
    // if(req.body.title == ''){
    //     req.flash('danger', 'Title is required');
    //     res.redirect('/articles/add');
    // }

    // req.checkBody('title', 'Title is required').nonEmpty();
    // req.checkBody('author', 'Author is required').nonEmpty();
    // req.checkBody('body', 'Body is required').nonEmpty();

    // //Get Errors
    // let errors = req.validationErrors();
    // let errors = {};

    // if (errors){
    //     res.render('add_article', {
    //         title: 'Add Article',
    //         errors: errors
    //     });
    // } else{
    //     let article = new ArticleModel();
    //     article.title = req.body.title;
    //     article.author = req.body.author;
    //     article.body = req.body.body;

    //     article.save(function(err){
    //         if (err){
    //             console.log(err);
    //             return;
    //         } else{
    //             req.flash('success', 'Article Added');
    //             res.redirect('/');
    //         }
    //     });
    // }
});

//Load Edit Form
app.get('/article/edit/:id', function(req, res){
    ArticleModel.findById(req.params.id, function(err, article){
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });  
    });
});

//Update Submit POST Route
app.post('/articles/edit/:id', function(req, res){
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
            req.flash('succes', 'Article Updated');
            res.redirect('/');
        }
    });
});

//Delete Article
app.delete('/articles/:id', function(req, res){
    let query = {_id:req.params.id};

    //





});

//Start Server
app.listen(3000, function(){
    console.log('Server started on port 3000...');
});