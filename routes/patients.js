const express = require('express');
const router = express.Router();

//Bring in Models
let UserModel = require('../models/user');
let AppointmentModel = require('../models/appointment');
let ReviewModel = require('../models/review');
let DentalOfficeModel = require('../models/dentalOffice');

//Load appointment checking form
router.get('/appointmentChecking', ensureAuthenticated, function(req, res){
    let dentalOffice = new DentalOfficeModel();
    dentalOffice.officeName = 'DrLeahuClinic';
    dentalOffice.address = 'Str. Vasile Alecsandri, nr 24';
    dentalOffice.doctors = [];
    dentalOffice.webPage = 'https:://cliniciledrleahu.ro/clinica-stomatologica-timisoara/';
    dentalOffice.shortDescription = 'We are a team of dentists from Timișoara with over 11 years of experience in the field.';
    dentalOffice.longDescription = 'A modern dental center in Timisoara '
    + 'Dr. Moraru Grigore leads a young and well-trained team of dentists passionate about this profession and devoted to their work. '
    +'With the help of this team of dentists you are provided with a whole range of specialized dental services:\n'
    +'- Dental implant\n'
    +'- Dental surgery\n'
    +'- Prosthetics: dental prostheses - fixed prosthesis, mobile prosthesis, skeletal prosthesis\n'
    +'- Dental aesthetics: dental descaling, teeth whitening, tooth brushing, dental fluoridation\n'
    +'- Dental radiology: periapical or retroalveolar radiography, occlusal radiography, bitewing radiography, panoramic radiography\n'
    +'- Physiognomic fillings\n'
    +'- Orthodontics\n'
    +'- Endodontic treatments\n'
    +'- Pedodontics\n'
    +'- Prophylaxis\n'
   dentalOffice.save(function(err){
    if (err){
        console.log(err);
        return;
    } else{
        req.flash('success', 'You are now registered!');
        res.redirect('/users/login');
    }
});
    // UserModel.find({role: 'Doctor'}, function(err, doctors){
    //     if (err){
    //         console.log(err);
    //     } else{
    //         res.render('firstAppointment',{
    //             doctors: doctors
    //         });
    //     }
    // });
});

//Send the information to check the available hours
router.post('/appointmentChecking', function(req, res){
    const doctorName = req.body.doctorName;
    const month = req.body.month;
    const day = req.body.day;
    const year = req.body.year;
    
    if( (day === '29' && month === 'February') || (day === '30' && month === 'February')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/patients/appointmentChecking');
    }
    else if( (day === '31') && (month === 'February' || month === 'April' || month === 'June' || month === 'September' || month === 'November')){
        req.flash('danger', 'Not a valid day');
        res.redirect('/patients/appointmentChecking');
    } else {
        res.redirect('/patients/appointment?doctorName='+doctorName+'&month='+month+'&day='+day+'&year='+year);
    }
});

//Load appointment form
router.get('/appointment', ensureAuthenticated, function(req, res){
    doctorName = req.query.doctorName;
    month = req.query.month;
    day = req.query.day;
    year = req.query.year;
    hours = ["09:00","09:45","10:30","11:15","12:00","13:30","14:15","15:00","15:45","16:30","17:15","18:00"];
    freeHours = [];
    AppointmentModel.find({doctorName: doctorName, month: month, day: day, status:'Sent', year: year}, function(err, appointments){
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

//Get doctor's profile
router.get('/doctorPofile/:id', ensureAuthenticated, function(req, res){
    UserModel.findById(req.params.id, function(err, user){
        ReviewModel.find({doctorName: user.name}, function(err, reviews){
            res.render('docProfile', {
                doctor: user,
                reviews: reviews
            }); 
        });
    });
});

//Get review page
router.get('/review/:id', ensureAuthenticated, function(req, res){
    UserModel.findById(req.params.id, function(err, user){
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
        let review = new ReviewModel();
        UserModel.findById(req.params.id, function(err, doctor){
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