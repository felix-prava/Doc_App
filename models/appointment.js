let mongoose = require('mongoose');

// Appointment Schema
let appointmentSchema = mongoose.Schema({
    doctorId:{
        type: String,
        required: true
    },
    doctorName:{
        type: String,
        required: true
    },
    patientId:{
        type: String,
        required: true
    },
    patientName:{
        type: String,
        required: true
    },
    month:{
        type: String,
        required: true,
    },
    day:{
        type: String,
        required: true
    },
    hour:{
        type: String,
        required: true
    },
    year:{
        type: String,
        required: true
    },
    details:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    docMessage:{
        type: String
    }
});

let Appointment = module.exports = mongoose.model('Appointment', appointmentSchema);