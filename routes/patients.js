const express = require('express');
const router = express.Router();

//Bring in Models
let UserModel = require('../models/user');
let AppointmentModel = require('../models/appointment');

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

    if( (day === '31') && (month === 'February' || month === 'April' || month === 'June' || month === 'September' || month === 'November')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/patients/appointment');
    } else{

        UserModel.findOne({name: doctorName}, function(err, doctor){
            if (err){
                console.log(err);
            } else{
                let appointment = new AppointmentModel();
                appointment.doctorId = doctor._id;
                appointment.doctorName = doctorName;
                appointment.patientId = req.user._id;
                appointment.patientName = req.user.name;
                appointment.month = month;
                appointment.day = day;
                appointment.details = details;
                appointment.status = 'Sent';
                appointment.save(function(err){
                    if (err){
                        console.log(err);
                        return;
                    } else{
                        req.flash('success', 'Appointment Saved');
                        res.redirect('/home');
                    }
                });
            }
        });   
    }
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
    UserModel.findById(req.params.id, function(err, user){
        res.render('docProfile', {
            doctor: user,
            author: user.name
        }); 
    });
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