const express = require('express');
const router = express.Router();

//Bring in Models
let UserModel = require('../models/user');
let AppointmentModel = require('../models/appointment');

//Load appointment checking form
router.get('/appointmentChecking', ensureAuthenticated, function(req, res){
    UserModel.find({role: 'Doctor'}, function(err, doctors){
        if (err){
            console.log(err);
        } else{
            res.render('firstAppointment',{
                doctors: doctors
            });
        }
    });
});

//Send the information to check the available hours
router.post('/appointmentChecking', function(req, res){
    const doctorName = req.body.doctorName;
    const month = req.body.month;
    const day = req.body.day;
    if( (day === '29' && month === 'February') || (day === '30' && month === 'February')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/patients/appointmentChecking');
    }
    else if( (day === '31') && (month === 'February' || month === 'April' || month === 'June' || month === 'September' || month === 'November')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/patients/appointmentChecking');
    } else {
        res.redirect('/patients/appointment?doctorName='+doctorName+'&month='+month+'&day='+day);
    }
});

//Load appointment form
router.get('/appointment', ensureAuthenticated, function(req, res){
    doctorName = req.query.doctorName;
    month = req.query.month;
    day = req.query.day;
    hours = ["09:00 ","09:45","10:30","11:15","12:00","13:30","14:15","15:00","15:45","16:30","17:15","18:00"];
    freeHours = [];
    AppointmentModel.find({doctorName: doctorName, month: month, day: day}, function(err, appointments){
        if (err){
            console.log(err);
        } else{ 
            hours.forEach(testedHour => {
                var find = false;
                appointments.forEach(element => {
                    if (testedHour == element.hour)
                        find = true;
                })
                if (find == false)
                    freeHours.push(testedHour);
            })
            res.render('appointment',{
                hours: freeHours,
                doctorName: doctorName
            });
        }
    });
});

//Add an appointment
router.post('/appointment', function(req, res){
    const doctorName = req.query.doctorName;
    const month = req.query.month;
    const day = req.query.day;
    const hour = req.body.hour;
    const details = req.body.details;
    if(details == '' ){
        req.flash('danger', 'Give us some details about your problem');
        res.redirect('/patients/appointment?doctorName='+doctorName+'&month='+month+'&day='+day);
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
                appointment.hour = hour;
                appointment.status = 'Sent';
                appointment.year = '2020';
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