// const mongoose = require('mongoose')

// var otpSchema = new mongoose.Schema({
//     opt:{
//         type:Number,
//         required:true
//     }
// })

// const otpDb = mongoose.model('otpDb',otpSchema)
// module.exports=otpDb;


const mongodb = require('mongoose');

const otpSchema = new mongodb.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

const otpdb = mongodb.model('OtpVerificationdbs', otpSchema);

module.exports = otpdb;