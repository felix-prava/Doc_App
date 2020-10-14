const express = require('express');
const router = express.Router();

//Bring in Models
let UserModel = require('../models/user');
let AppointmentModel = require('../models/appointment');

//Select a date for future appointments
router.get('/selectDate', ensureAuthenticated, function(req, res){
    res.render('docSelectNextApp');
});

//Send the information to check the future appointments
router.post('/selectDate', ensureAuthenticated, function(req, res){
    const year = req.body.year;
    const month = req.body.month;
    const day = req.body.day;
    console.log(year);
    console.log(month);
    console.log(day);
    console.log(req.user.name);
    AppointmentModel.find({doctorName: req.user.name, year:year, month:month, day:day, status:'Sent'}, function(err, appointments){
        console.log(appointments);
        console.log(appointments.length);
        if(err){ 
            console.log(err);
        } else{
            res.redirect('/doctors/futureAppointments');
        }
    })
});

//List of a doctor's future appointments
router.get('/futureAppointments', ensureAuthenticated, function(req, res){
    console.log(req.user.name);
    AppointmentModel.find({doctorName: req.user.name, status: 'Sent'}, function(err, appointments){
        if(err){ 
            console.log(err);
        } else{
            res.render('docNextAppointments', {
                appointments: appointments
            });
        }
    });
});

//Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        if (req.user.role == 'Doctor')
            return next();
        else {
            console.log(req.user.role);
            req.flash('danger', 'Not Authorized');
            res.redirect('/home');
        }
    } else{
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;