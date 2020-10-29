const express = require('express');
const router = express.Router();

//Bring in User Model
let conversationModel = require('../models/conversation');
let userModel = require('../models/user');
let appointmentModel = require('../models/appointment');
let dentalOffice = require('../models/dentalOffice');

//Bring in chat page
router.get('', isAuthenticated, function(req, res){
    if (req.user.role == 'Patient'){
        conversationModel.find({patientName: req.user.name}, function(err, conversations){
            if (err){
                console.log(err);
            } else{
                res.render('chatMenu',{
                    conversations: conversations,
                });
            }
        });
    } else{
        conversationModel.find({doctorName: req.user.name}, function(err, conversations){
            if (err){
                console.log(err);
            } else{
                res.render('chatMenu',{
                    conversations: conversations
                });
            }
        }); 
    }
});

//Select a user for the new conversation
router.get('/add/conversation', isAuthenticated, function(req, res){
    if (req.user.role == 'Patient'){
        userModel.find({role: 'Doctor'}, function(err, doctors){
            let users = [];
            doctors.forEach(doctor => {
                users.push(doctor.name);
            });
            res.render('chatUserSelect',{
                users: users
            });
        });
    } else{
        appointmentModel.find({doctorName: req.user.name}, function(err, appointments){
            if (err){
                console.log(err);
            } else{
                let users = [];
                appointments.forEach(appointment =>{
                    if (!users.includes(appointment.patientName))
                        users.push(appointment.patientName);
                })
                res.render('chatUserSelect', {
                    users: users
                });
            }
        });
    }
});

//Create a new conversation
router.post('/add/conversation', function(req, res){
    secondUser_ = req.body.userName;
    userModel.findOne({name: secondUser_}, function(err, secondUser){
        if (err){
            console.log(err);
        } else{
            if (req.user.role == 'Patient'){
                let newConv = newConversation(req.user.name, req.user.username, req.user._id, secondUser.name, secondUser.username, secondUser._id);
                if (newConv){
                    res.redirect('/chat/conversation/'+ newConv);
                }
            } else{
                let newConv = newConversation(secondUser.name, secondUser.username, secondUser._id, req.user.name, req.user.username, req.user._id);
                if (newConv){
                    res.redirect('/chat/conversation/'+newConv);
                }
            }
        }
    });
});

//Display the messages from a conversation
router.get('/conversation/:id', isAuthenticated, function(req, res){
    conversationModel.findById(req.params.id, function(err, conversation){
        if (err){
            console.log(err);
        } else{
            res.render('conversation',{
                conversation: conversation
            });
        }
    });
});

//Submit a new message
router.post('/conversation/:id', function(req, res){
    if (req.body.message == ''){
        req.flash('danger', 'You can not send an empty message');
        res.redirect('/chat/conversation/'+req.params.id);
    } else{ 
        conversationModel.findById(req.params.id, function(err, conversation){
            if (err){
                console.log(err);
            } else{
                let newConversation = {};
                newConversation.patientName = conversation.patientName;
                newConversation.patientUsername = conversation.patientUsername;
                newConversation.patientId = conversation.patientId;
                newConversation.doctorName = conversation.doctorName;
                newConversation.doctorUsername = conversation.doctorUsername;
                newConversation.doctorId = conversation.doctorId;
                currentMessages = conversation.messages;
                if (req.user.role == 'Doctor')
                    currentMessages.push('1' + req.body.message);
                else
                    currentMessages.push('2' + req.body.message);
                newConversation.messages = currentMessages;

                let query = {_id:req.params.id};

                conversationModel.updateOne(query, newConversation, function(err){
                    if (err){
                        console.log(err);
                        return;
                    } else{
                        res.redirect('/chat/conversation/'+req.params.id);
                    }
                });
            }
        });
    }
});


//Access Control
function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else{
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

//Add a new conversation
function newConversation(patientName, patientUsername, patientId, doctorName, doctorUsername, doctorId){
    let conversation = new conversationModel();
    conversation.patientName = patientName;
    conversation.patientUsername = patientUsername;
    conversation.patientId = patientId;
    conversation.doctorName = doctorName;
    conversation.doctorUsername = doctorUsername;
    conversation.doctorId = doctorId;
    conversation.messages = [];
    conversation.firstMessage = '0';
    conversation.save(function(err){
        if (err){
            console.log(err);
            return;
        }
    });
    return conversation._id;
}

module.exports = router;