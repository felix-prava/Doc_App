let mongoose = require('mongoose');

// Conversation Schema
let ConversationSchema = mongoose.Schema({
    patientName :{
        type: String,
        required: true
    },
    patientUsername :{
        type: String,
        required: true
    },
    patientId :{
        type: String,
        required: true
    },
    doctorName:{
        type: String,
        required: true
    },
    doctorUsername :{
        type: String,
        required: true
    },
    doctorId :{
        type: String,
        required: true
    },
    messages :{
        type: Array
    }
});

const Conversation = module.exports = mongoose.model('Conversation', ConversationSchema);