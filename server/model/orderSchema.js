const mongodb = require('mongoose');

const orderSchema = new mongodb.Schema({
    userId: {
        type: String,
        required: true,
    },
    orderItems: [
        {
            productId: {
                type: mongodb.SchemaTypes.ObjectId,
                required: true,
            },
            images: {
                type: Array,
                required: true
            },
            Pname: {
                type: String,
                required: true
            },
            Pcategory: {
                type: String,
                required: true
            },
            price: {
                type: String,
                required: true
            },
            units: {
                type: Number,
                required: true
            },
            action: {
                type: Boolean,
                default: false
            },
            orderStatus: {
                type: String,
                default: "Pending",
                required: true
            },
            couponCode: {
                type: String,
                default: null
            },
            priceAfterCoupon: {
                type: Number,
                default: 0
            }
        }
    ],
    paymentMethod: {
        type: String,
        required: true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    address: {
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
        }
    }
});

const Orderdb = mongodb.model('Orderdb', orderSchema);

module.exports = Orderdb;