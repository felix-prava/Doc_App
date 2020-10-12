const express = require('express');
const router = express.Router();

//Bring in Models
let UserModel = require('../models/user');
let AppointmentModel = require('../models/appointment');
const user = require('../models/user');

//Load appointment form
router.get('/appointment', ensureAuthenticated, function(req, res){
    UserModel.find({role: 'Doctor'}, function(err, doctors){
        if (err){
            console.log(err);
        } else{
            res.render('appointment',{
                doctors: doctors
            });
        }
    });
});

//Add an appointment
router.post('/appointment', function(req, res){
    const doctorName = req.body.doctorName;
    const month = req.body.month;
    const day = req.body.day;
    const details = req.body.details;
    console.log(req.body.doctorName);
    console.log(req.body.month);
    console.log(day);
    console.log(req.body.list2);
});

//List of doctors page
router.get('/doctorslist', ensureAuthenticated, function(req, res){
    UserModel.find({role: 'Doctor'}, function(err, doctors){
        if (err){
            console.log(err);
        } else{
            res.render('doctorsList', {
                doctors: doctors
            });
        }
    });
});

//Get Single Doctor
router.get('/doctorPofile/:id', function(req, res){
    //res.render('docProfile');
    // ArticleModel.findById(req.params.id, function(err, article){
        UserModel.findById(req.params.id, function(err, user){
            res.render('docProfile', {
                doctor: user,
                author: user.name
            }); 
        });
    // });
});

//Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        if (req.user.role == 'Patient')
            return next();
        else {
            console.log(req.user.role);
            req.flash('danger', 'Not Authorized');
            res.redirect('/homeDoc');
        }
    } else{
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;