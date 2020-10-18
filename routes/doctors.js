const express = require('express');
const router = express.Router();

//Bring in Models
let UserModel = require('../models/user');
let AppointmentModel = require('../models/appointment');

//Profile Editing Form
router.get('/profile', ensureAuthenticated, function(req, res){
    UserModel.findById(req.user._id, function(err, user){
        if (err){
            console.log(err);
        } else{
            res.render('docProfileEdit',{
                user: user
            });
        }
    })
});

//Update Profile
router.post('/profile', function(req, res){
    let newUser = {};
    newUser.name = req.user.name;
    newUser.email = req.body.email;
    newUser.username = req.user.username;
    newUser.password = req.user.password;
    newUser.role = 'Doctor';
    newUser.profile = req.body.profile;

    req.checkBody('email', 'Email is not valid').isEmail();
    let errors = req.validationErrors();
    if(errors){
        req.flash('danger', 'Email is not valid');
        res.redirect('/doctors/profile');
    } else{
        UserModel.updateOne({_id:req.user._id}, newUser, function(err){
            if (err){
                console.log(err);
                return;
            } else{
                req.flash('success', 'Profile Updated');
                res.redirect('/homeDoc');
            }
        });
    }
});

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
    
    AppointmentModel.findById(req.params.id, function(err, appointment){
        if (err){
            console.log(err);
        } else{
            let appointmentDone = new AppointmentModel();
            var nextMonth = Number(req.body.size);
            var changeYear = false;
            arr = ["January","February","March","April","May","June","July","August","September","October", "November","December"];
            for(var i = 0; i < arr.length; i++){
                if (arr[i] == appointment.month)
                    var index = i + 1;
            }
            if (index + nextMonth > 12){
                changeYear = true;
                nextMonth = (index + nextMonth) % 12;
            }
            else{ 
                nextMonth = (index + nextMonth);
            }
            
            var newYear = '';
            if (changeYear == true){
                if (appointment.year == '2020')
                    newYear = '2021';
                else if (appointment.year == '2021')
                    newYear = '2022';
            } else{
                newYear = '2020';
            }

            appointmentDone.doctorId = appointment.doctorId;
            appointmentDone.doctorName = appointment.doctorName;
            appointmentDone.patientId = appointment.patientId;
            appointmentDone.patientName = appointment.patientName;
            appointmentDone.month = arr[nextMonth - 1];
            appointmentDone.day = appointment.day;
            appointmentDone.details = 'Dental control';
            appointmentDone.hour = appointment.hour;
            appointmentDone.status = 'Sent';
            appointmentDone.year = newYear;

            let correctDate = true;
            if( (appointmentDone.day === '31') && (arr[nextMonth - 1] === 'February' || arr[nextMonth - 1] === 'April' || arr[nextMonth - 1] === 'June' || arr[nextMonth - 1] === 'September' || arr[nextMonth - 1] === 'November'))
                correctDate = false;
            if( (appointmentDone.day === '29' && arr[nextMonth - 1] === 'February') || (appointmentDone.day === '30' && arr[nextMonth - 1] === 'February'))
                correctDate = false;
            let query = {doctorName:appointment.doctorName, day:appointment.day, status: 'Sent', month:arr[nextMonth - 1], year:newYear, hour:appointment.hour};
            let queryWithoutHours = {doctorName:appointment.doctorName, day:appointment.day, status: 'Sent', month:arr[nextMonth - 1], year:newYear}

            AppointmentModel.find(queryWithoutHours, function(err, appointmentCheck){
                if (err){
                    console.log(err);
                } else{
                    if (appointmentCheck){ 
                        if(appointmentCheck.length == 12){ 
                            console.log(appointmentCheck.length);
                            console.log(appointmentCheck);
                            req.flash('danger', 'All day is full');
                            res.redirect('/doctors/appointment/'+appointment._id);
                        } else{
                            AppointmentModel.find(query, function(err, appointmentCheckHour){
                                if (err){
                                    console.log(err);
                                } else{ 
                                    if(appointmentCheckHour.length == 1){
                                        req.flash('danger', 'There is already an appointment at this hour');
                                        res.redirect('/doctors/appointment/'+appointment._id);
                                    }
                                    else{
                                        if (correctDate == true){ 
                                            appointmentDone.save(function(err){
                                                if (err){
                                                    console.log(err);
                                                    return;
                                                } else{
                                                    req.flash('success', 'New Appointment Set');
                                                    res.redirect('/homeDoc');
                                                }
                                            });
                                        } else{
                                            req.flash('danger', 'Over ' + req.body.size + ' month(s), does not exist ' + appointmentDone.day + ' of ' + appointmentDone.month);
                                            res.redirect('/doctors/appointment/'+appointment._id); 
                                        }
                                    };                                
                                }
                            });
                        }
                    }
                }
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