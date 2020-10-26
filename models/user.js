let mongoose = require('mongoose');

// User Schema
let UserSchema = mongoose.Schema({
    name :{
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true
    },
    username :{
        type: String,
        required: true
    },
    password :{
        type: String,
        required: true
    },
    role :{
        type: String,
        required: true
    },
    profile :{
        type: String
    },
    dentalOffice :{
        type: String
    }
});

const User = module.exports = mongoose.model('User', UserSchema);