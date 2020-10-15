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

    if( (day === '29' && month === 'February') || (day === '30' && month === 'February')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/doctors/selectDate');
    }
    else if( (day === '31') && (month === 'February' || month === 'April' || month === 'June' || month === 'September' || month === 'November')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/doctors/selectDate');
    } else {
        res.redirect('/doctors/futureAppointments?year='+year+'&month='+month+'&day='+day);
    }
});

//List of a doctor's future appointments
router.get('/futureAppointments', ensureAuthenticated, function(req, res){
    AppointmentModel.find({doctorName: req.user.name, status: 'Sent', year: req.query.year, month:req.query.month, day:req.query.day}, function(err, appointments){
        if(err){ 
            console.log(err);
        } else{
            if (appointments.length > 0) { 
                res.render('docNextAppointments', {
                    title: 'Appointments',
                    appointments: appointments
                });
            }
            else{
                res.render('docNextAppointments', {
                    title: 'No appointments today',
                    appointments: appointments
                });  
            }
        }
    });
});

//Select a date for future appointments
router.get('/appointment/:id', ensureAuthenticated, function(req, res){
    AppointmentModel.findById(req.params.id, function(err, appointment){
        if (err){
            console.log(err);
        } else{
            res.render('appointment', {
                appointment: appointment
            }); 
        }
    });
});

//Change the status of the appointment
router.get('/appointment/done/:id', ensureAuthenticated, function(req, res){
    AppointmentModel.findById(req.params.id, function(err, appointment){
        if (err){
            console.log(err);
        } else{
            if (appointment.status == 'Sent'){
                let appointmentDone = {};
                appointmentDone.doctorId = appointment.doctorId;
                appointmentDone.doctorName = appointment.doctorName;
                appointmentDone.patientId = appointment.patientId;
                appointmentDone.patientName = appointment.patientName;
                appointmentDone.month = appointment.month;
                appointmentDone.day = appointment.day;
                appointmentDone.details = appointment.details;
                appointmentDone.hour = appointment.hour;
                appointmentDone.status = 'Resolved';
                appointmentDone.year = appointment.year;
                let query = {_id:req.params.id};

                AppointmentModel.updateOne(query, appointmentDone, function(err){
                    if (err){
                        console.log(err);
                        return;
                    } else{
                        req.flash('success', 'Congrats! You finished with this client');
                        res.redirect('/doctors/appointment/'+appointment._id);
                    }
                });
            }
        }
    });
});

//Submit a future appointment 
router.post('/appointment/:id', function(req, res){
    console.log(req.body.size);
    
    AppointmentModel.findById(req.params.id, function(err, appointment){
        if (err){
            console.log(err);
        } else{
            res.redirect('/doctors/appointment/'+req.params.id);
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