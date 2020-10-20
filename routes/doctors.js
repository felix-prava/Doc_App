const express = require('express');
const router = express.Router();

//Bring in Models
let UserModel = require('../models/user');
let AppointmentModel = require('../models/appointment');
let DentalOfficeModel = require('../models/dentalOffice');
const e = require('express');

//Profile Editing Form
router.get('/profile', ensureAuthenticated, function(req, res){
    UserModel.findById(req.user._id, function(err, user){
        if (err){
            console.log(err);
        } else{
            DentalOfficeModel.find({}, function(err, dentalOffices){
                if(err){
                    console.log(err);
                } else{
                    res.render('docProfileEdit',{
                        user: user,
                        dentalOffices: dentalOffices
                    });
                }
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
    newUser.dentalOffice = req.body.dentalOffice;

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
                newYear = appointment.year;
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

//Redirect the information
router.get('/appointment/selectDate/redirect/:id', ensureAuthenticated, function(req, res){
    let idd = req.params.id;
    res.redirect('/doctors/appointment/selectDate/'+idd);
});

//Get form for chack date
router.get('/appointment/selectDate/:id', ensureAuthenticated, function(req, res){
    res.render('doctorManualSelect',{
        id: req.params.id
    });
});

//Send the information to check the available hours
router.post('/appointment/selectDate/:id', function(req, res){
    const month = req.body.month;
    const day = req.body.day;
    const year = req.body.year;
    let idd = req.params.id;
    
    if( (day === '29' && month === 'February') || (day === '30' && month === 'February')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/doctors/appointment/selectDate/'+req.params.id);
    }
    else if( (day === '31') && (month === 'February' || month === 'April' || month === 'June' || month === 'September' || month === 'November')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/doctors/appointment/selectDate/'+req.params.id);
    } else {
        res.redirect('/doctors/selectHour?month='+month+'&day='+day+'&year='+year+'&prevId='+idd);
    }
});

//Get hour&message appointment form
router.get('/selectHour', ensureAuthenticated, function(req, res){
    doctorName = req.user.name;
    month = req.query.month;
    day = req.query.day;
    year = req.query.year;
    prevId = req.query.prevId;

    hours = ["09:00","09:45","10:30","11:15","12:00","13:30","14:15","15:00","15:45","16:30","17:15","18:00"];
    freeHours = [];
    AppointmentModel.find({doctorName: doctorName, month: month, day: day, status:'Sent', year: year}, function(err, appointments){
        if (err){
            console.log(err);
        } else{ 
            console.log(appointments)
            hours.forEach(testedHour => {
                var find = false;
                appointments.forEach(element => {
                    if (testedHour == element.hour)
                        find = true;
                })
                if (find == false)
                    freeHours.push(testedHour);
            })
            res.render('doc_add_appointment',{
                hours: freeHours,
                doctorName: doctorName,
                prevId: prevId
            });
        }
    });
});

//Add an appointment
router.post('/selectHour', function(req, res){
    const doctorName = req.user.doctorName;
    const month = req.query.month;
    const day = req.query.day;
    const hour = req.body.hour;
    const year = req.query.year;
    const details = req.body.details;
    const idd = req.query.idd;
    if(details == '' ){
        req.flash('danger', 'Give us some details about your problem');
        res.redirect('/doctors/selectHour?month='+month+'&day='+day+'&year='+year+'&prevId='+idd);
    } else{ 
        AppointmentModel.findOne({id: idd}, function(err, appoint){
            if (err){
                console.log(err);
            } else{
                let appointment = new AppointmentModel();
                appointment.doctorId = req.user._id;
                appointment.doctorName = req.user.name;
                appointment.patientId = appoint.patientId;
                appointment.patientName = appoint.patientName;
                appointment.month = month;
                appointment.day = day;
                appointment.hour = hour;
                appointment.year = year;
                appointment.details = details;
                appointment.status = 'Sent';
                appointment.save(function(err){
                    if (err){
                        console.log(err);
                        return;
                    } else{
                        req.flash('success', 'Appointment Saved');
                        res.redirect('/homeDoc');
                    }
                });
            }
        });   
    }
});

//Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        if (req.user.role == 'Doctor')
            return next();
        else {
            req.flash('danger', 'Not Authorized');
            res.redirect('/home');
        }
    } else{
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;