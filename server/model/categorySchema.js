const mongodb = require('mongoose');
var categorySchema = new mongodb.Schema({
    name: { 
        type: String, 
        required: true 
    },
    action:{
        type:Boolean,
        default:false
    }
})
const categorydb = mongodb.model('Category', categorySchema);

module.exports = categorydb;