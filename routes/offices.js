const express = require('express');
const router = express.Router();

//Bring in models
let DentalOfficeModel = require('../models/dentalOffice');
let UserModel = require('../models/user');

//List of dental offices
router.get('/dental-offices-list', ensureAuthenticated, function(req, res){
    DentalOfficeModel.find({}, function(err, dentalOffices){
        if (err){
            console.log(err);
        } else{
            res.render('officesList', {
                title: 'Dental Offices',
                dentalOffices: dentalOffices
            });
        }
    });
});

//Get a single office
router.get('/:id', ensureAuthenticated, function(req, res){
    DentalOfficeModel.findById(req.params.id, function(err, dentalOffice){
        if(err){
            console.log(err);
        } else{
            res.render('singleOffice',{
                dentalOffice: dentalOffice
            });
        }
    });
});

//Appointment for a dental office
router.get('/appointment/:id', function(req, res){
    DentalOfficeModel.findById(req.params.id, function(err, dentalOffice){
        if(err){
            console.log(err);
        } else{
            UserModel.find({role: 'Doctor', dentalOffice: dentalOffice.officeName}, function(err, doctors){
                res.render('officeAddApp',{
                    dentalOffice: dentalOffice,
                    doctors: doctors
                });
            });          
        }
    });
})

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