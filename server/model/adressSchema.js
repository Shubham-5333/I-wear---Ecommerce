const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    address:[ 
        {
         name:{
            type:String,
            required:true,
         },
         CAddress: {
            type: String,
            required: true
        },
         street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pin: {
            type: Number,
            required: true
        },
        defaultAddress:{
            type: Boolean,
            required:true,
            default:true    
        }
       },
    ],
})

const addressdb = mongoose.model('Addressdb', AddressSchema); // Use 'Address' as the model name
module.exports = addressdb;
