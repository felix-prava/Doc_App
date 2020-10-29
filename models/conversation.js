let mongoose = require('mongoose');

// Messages Schema
let messagesSchema = mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    patientUsername: {
        type: String,
        required: true
    },
    patientId: {
        type: String,
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    doctorUsername :{
        type: String,
        required: true
    },
    doctorId: {
        type: String,
        required: true
    },
    messages: {
        type: Array
    }
});

const Messages = module.exports = mongoose.model('Messages', messagesSchema);