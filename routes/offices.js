const express = require('express');
const router = express.Router();

//Bring in models
let DentalOfficeModel = require('../models/dentalOffice');
let UserModel = require('../models/user');
let AppointmentModel = require('../models/appointment')

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
            UserModel.find({role: 'Doctor', dentalOffice: dentalOffice.officeName}, function(err, doctors){
                res.render('singleOffice',{
                    dentalOffice: dentalOffice,
                    doctors: doctors
                });
            });
        }
    });
});

//Appointment for a dental office
router.get('/appointment/:id', ensureAuthenticated, function(req, res){
    DentalOfficeModel.findById(req.params.id, function(err, dentalOffice){
        if(err){
            console.log(err);
        } else{
            UserModel.find({role: 'Doctor', dentalOffice: dentalOffice.officeName}, function(err, doctors){
                res.render('officeAddApp',{
                    dentalOffice: dentalOffice,
                    doctors: doctors,
                    idd: req.params.id
                });
            });          
        }
    });
});

//Send the information to check the available hours
router.post('/appointment/:id', function(req, res){
    const month = req.body.month;
    const day = req.body.day;
    const year = req.body.year;
    const idd = req.params.id;
    
    if( (day === '29' && month === 'February') || (day === '30' && month === 'February')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/offices/appointment/'+idd);
    }
    else if( (day === '31') && (month === 'February' || month === 'April' || month === 'June' || month === 'September' || month === 'November')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/offices/appointment/'+idd);
    } else {
        res.redirect('/offices/appointment/check/selectHour?month='+month+'&day='+day+'&year='+year+'&idd='+idd);
    }
});

//Load appointment form
router.get('/appointment/check/selectHour', ensureAuthenticated, function(req, res){
    let idd = req.query.idd;
    let month = req.query.month;
    let day = req.query.day;
    let year = req.query.year;
    let hours = ["09:00","09:45","10:30","11:15","12:00","13:30","14:15","15:00","15:45","16:30","17:15","18:00"];
    let freeHours = [];
    DentalOfficeModel.findById(idd, function(err, office){
        if(err){
            console.log(err);
        } else{
            UserModel.find({role: 'Doctor', dentalOffice: office.officeName}, function(err, doctors){
                if(err){
                    console.log(err);
                }
                else{
                    let index = 0;
                    doctors.forEach(doctor => {
                        let hours_query = {doctorName: doctor.name, month: month, day: day, status:'Sent', year: year}
                        AppointmentModel.find(hours_query, function(err, appointments){
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
                                });
                                index++;
                                if(index === doctors.length){
                                    var uniqueHours = [];
                                    freeHours.forEach(element =>{
                                        if (!uniqueHours.includes(element))
                                            uniqueHours.push(element)
                                    });
                                    uniqueHours.sort();
                                    res.render('officeHoursApp',{
                                        hours: uniqueHours,
                                        idd: req.query.idd,
                                        year: req.query.year,
                                        month: req.query.month,
                                        day: req.query.day
                                    });
                                }
                            }
                        });
                    });
                }
            });
        }
    });
});

//Add an appointment
router.post('/appointment/check/selectHour', function(req, res){
    const month = req.query.month;
    const day = req.query.day;
    const hour = req.body.hour;
    const year = req.query.year;
    const idd = req.query.idd;
    const details = req.body.details;
    if(details == '' ){
        req.flash('danger', 'Give us some details about your problem');
        res.redirect('/offices/appointment/check/selectHour?month='+month+'&day='+day+'&year='+year+'&idd='+idd);
    } else{ 
        DentalOfficeModel.findById(idd, function(err, dentalOffice){
            if(err){
                console.log(err);
            } else{
                UserModel.find({role: 'Doctor', dentalOffice: dentalOffice.officeName}, function(err, doctors){
                    var appointmentAdded = false;
                    doctors.forEach(doctor =>{
                        if (appointmentAdded == false){
                            let query = {day: day, year: year, month: month, status:'Sent', doctorName: doctor.name, hour: hour}
                            AppointmentModel.find(query, function(err, appointments){
                                if (err){
                                    console.log(err);
                                }
                                else{
                                    if (appointments)
                                        if (appointments.length == 0){
                                            appointmentAdded = true;
                                            let newApp = AppointmentModel();
                                            newApp.doctorId = doctor.id;
                                            newApp.doctorName = doctor.name;
                                            newApp.patientId = req.user.id;
                                            newApp.patientName = req.user.name;
                                            newApp.month = month;
                                            newApp.day = day;
                                            newApp.hour = hour;
                                            newApp.year = year;
                                            newApp.details = details;
                                            newApp.status = 'Sent';
                                            newApp.save(function(err){
                                                if (err){
                                                    console.log(err);
                                                    return;
                                                } else{
                                                    req.flash('success', 'Appointment Saved');
                                                    res.redirect('/home');
                                                }
                                            });
                                        }
                                }
                            });
                        }
                    });
                });          
            }
        });
    }
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