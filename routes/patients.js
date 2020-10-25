const express = require('express');
const router = express.Router();

//Bring in Models
let userModel = require('../models/user');
let appointmentModel = require('../models/appointment');
let reviewModel = require('../models/review');
let dentalOfficeModel = require('../models/dentalOffice');

//Load appointment checking form
router.get('/appointmentChecking', isAuthenticated, function(req, res){
    userModel.find({role: 'Doctor'}, function(err, doctors){
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
    const year = req.body.year;
    
    let invalidMonths = ["February", "April", "June", "September", "November"];
    
    if( (day === '29' && month === 'February') || (day === '30' && month === 'February')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/patients/appointmentChecking');
    }
    else if (invalidDates(invalidMonths, '31', month, day) == 0){
        req.flash('danger', 'Not a valid day');
        res.redirect('/patients/appointmentChecking');
    } else {
        res.redirect('/patients/appointment?doctorName='+doctorName+'&month='+month+'&day='+day+'&year='+year);
    }
});

//Load appointment form
router.get('/appointment', isAuthenticated, function(req, res){
    doctorName = req.query.doctorName;
    month = req.query.month;
    day = req.query.day;
    year = req.query.year;
    hours = ["09:00", "09:45", "10:30", "11:15", "12:00", "13:30", "14:15", "15:00", "15:45", "16:30", "17:15", "18:00"];
    freeHours = [];
    appointmentModel.find({doctorName: doctorName, month: month, day: day, status:'Sent', year: year}, function(err, appointments){
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
            res.render('add_appointment',{
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
    const year = req.query.year;
    const details = req.body.details;
    if(details == '' ){
        req.flash('danger', 'Give us some details about your problem');
        res.redirect('/patients/appointment?doctorName='+doctorName+'&month='+month+'&day='+day+'&year='+year);
    } else{ 
        userModel.findOne({name: doctorName}, function(err, doctor){
            if (err){
                console.log(err);
            } else{
                let appointment = new appointmentModel();
                appointment.doctorId = doctor._id;
                appointment.doctorName = doctorName;
                appointment.patientId = req.user._id;
                appointment.patientName = req.user.name;
                appointment.month = month;
                appointment.day = day;
                appointment.details = details;
                appointment.hour = hour;
                appointment.status = 'Sent';
                appointment.year = year;
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
router.get('/doctorslist', isAuthenticated, function(req, res){
    userModel.find({role: 'Doctor'}, function(err, doctors){
        if (err){
            console.log(err);
        } else{
            res.render('doctorsList', {
                doctors: doctors
            });
        }
    });
});

//Get doctor's profile
router.get('/doctor/profile/:id', isAuthenticated, function(req, res){
    userModel.findById(req.params.id, function(err, user){
        reviewModel.find({doctorName: user.name}, function(err, reviews){
            dentalOfficeModel.findOne({officeName: user.dentalOffice}, function(err, dentalOffice){
                res.render('docProfile', {
                    doctor: user,
                    reviews: reviews,
                    dentalOffice: dentalOffice
                }); 
            });
        });
    });
});

//Get review page
router.get('/review/:id', isAuthenticated, function(req, res){
    userModel.findById(req.params.id, function(err, user){
        res.render('reviewForm', {
            doctor: user
        }); 
    });
});

//Add a review for a doctor
router.post('/review/:id', function(req, res){
    if (req.body.description == ''){
        req.flash('danger', 'Would you like to give us some details?');
        res.redirect('/patients/review/'+req.params.id);
    } else{
        let review = new reviewModel();
        userModel.findById(req.params.id, function(err, doctor){
            review.doctorId = req.params.id;
            review.doctorName = doctor.name;
            review.patientId = req.user._id;
            review.patientName = req.user.name;
            review.patientMessage = req.body.description;
            review.numberOfStars = req.body.star;

            review.save(function(err){
                if (err){
                    console.log(err);
                    return;
                } else{
                    req.flash('success', 'Review Added');
                    res.redirect('/home');
                }
            });
        });    
    }
})

router.get('/my-appointments', isAuthenticated, function(req, res){
    appointmentModel.find({patientName: req.user.name, status: 'Sent'}, function(err, appointments){
        if(err){
            console.log(err);
        }
        else{
            res.render('my_appointments',{
                appointments: appointments
            });
        }
    });
});

//Access Control
function isAuthenticated(req, res, next){
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

//Check for invalid dates
function invalidDates(months, day, actualMonth, actualDay){
    if (actualDay != day)
        return 1;
    else{
        if (months.includes(actualMonth))
            return 0;
        else    
            return 1;
    }
}

module.exports = router;