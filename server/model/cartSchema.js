const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                required: true,
            },
            quantity: {
                type: Number,
                default: 1
            },
            
        },
    ]
});

const cartdb = mongoose.model('cartdb', cartSchema);

module.exports = cartdb;
