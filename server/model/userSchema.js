const mongoose = require('mongoose')


var schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide a name']
        },
        email:{
            type: String,
            unique: true,
            required:true,
        },
        password:{
            type :String,
            required:true
        },
        status:{
            type:String,
            default:"Inactive"
        },
        action:{
            type:Boolean,
            default:false
        }

    })

    const Userdb = mongoose.model('userdb',schema)
    module.exports = Userdb;