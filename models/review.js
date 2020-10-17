let mongoose = require('mongoose');

// Review Schema
let reviewSchema = mongoose.Schema({
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
    patientMessage:{
        type: String,
        required: true
    },
    numberOfStars:{
        type: String,
        required: true
    }
});

let Review = module.exports = mongoose.model('Review', reviewSchema);