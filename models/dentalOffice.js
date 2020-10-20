let mongoose = require('mongoose');

// Dental Office Schema
let dentalOfficeSchema = mongoose.Schema({
    officeName:{
        type: String,
        required: true
    },
    address:{
        type: String,
        require: true
    },
    doctors:{
        type: Array
    },
    webPage:{
        type: String
    },
    shortDescription:{
        type: String
    },
    longDescription:{
        type: String
    }
});

let DentalOffice = module.exports = mongoose.model('DentalOffice', dentalOfficeSchema);