const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    images:{
        type:Array,
        required:true
    },
    Pname: { 
        type: String, 
        required: true 
    },
    Pcategory:{
        type:String,
        required:true
    }, 
    price:{
        type:Number,
        required:true
    },
    units:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    action:{
        type:Boolean,
        default:false
    }
})

const productdb = mongoose.model('productdb', productSchema);

module.exports = productdb;