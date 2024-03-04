const addressdb = require('../model/adressSchema');
const Userdb = require('../model/userSchema');
const mongoose = require('mongoose')

// exports.saveAddress = async (req, res) => {

//     let checkAddress = await addressdb.findOne({ user_Id: req.session.userId })

//     if (!checkAddress) {
//         checkAddress = new addressdb({
//             user_Id: req.session.userId,
//             address: [{
//                 name: req.body.name,
//                 address: req.body.address,
//                 phone: req.body.phoneNumber,
//                 city: req.body.city,
//                 district: req.body.district,
//                 pin: req.body.pinCode,

//             }]
//         })


//     } else {
//         checkAddress.address.push({
//             name: req.body.name,
//             address: req.body.address,
//             phone: req.body.phoneNumber,
//             city: req.body.city,
//             district: req.body.district,
//             pin: req.body.pinCode,
//             defaultAddress: false

//         })
//     }
//     checkAddress.save()
//         .then(data => {
//             res.redirect('/profile/address_management')
//         })
//         .catch(err => {
//             res.status(400).send({
//                 message: err.message || "Some error "
//             })
//         })

// }
exports.AddAddress = async (req, res) => {
    console.log("kjhjkhkhk");
    try {
        let data = await addressdb.findOne({ userId: req.session.email });
        console.log(data)
        if ( data==null ) {

            console.log('ghghgghg');
            data = new addressdb({
                userId: req.session.email,
                address: [{
                    name: req.body.name.trim(),
                    CAddress: req.body.address.trim(),
                    street: req.body.street.trim(),
                    city: req.body.city.trim(),
                    state: req.body.state.trim(),
                    pin: req.body.pin
                }]
            });   
           
        }else if(data.address.length==0){
           
            data.address.push({   
            name: req.body.name.trim(),
            CAddress: req.body.address.trim(),
            street: req.body.street.trim(),
            city: req.body.city.trim(),
            state: req.body.state.trim(),
            pin: req.body.pin,
            defaultAddress: true
        });

        }
         else {
            console.log("nnnn");
            data.address.push({
                name: req.body.name.trim(),
                CAddress: req.body.address.trim(),
                street: req.body.street.trim(),
                city: req.body.city.trim(),
                state: req.body.state.trim(),
                pin: req.body.pin.trim(),
                defaultAddress: false
            });
        }

        const userData = await data.save();
        console.log("hyyy");
        res.status(200).redirect('/showAdress');
    } catch (error) {
        console.error(error);
        res.status(400).send({ success: false, msg: error.message });
    }
};


exports.postEditAddress = async (req, res) => {
    console.log("hihi");
    console.log("userId:", req.session.email);
    console.log("addressId:", req.query.addressId);
    
    try {
        const updatedAddress = await addressdb.findOneAndUpdate(
            {
                userId: req.session.email,
                "address._id": new mongoose.Types.ObjectId(req.query.addressId)
            },
            {
                $set: {
                    "address.$.name": req.body.name.trim(),
                    "address.$.CAddress": req.body.address.trim(),
                    "address.$.street": req.body.street.trim(),
                    "address.$.city": req.body.city.trim(),
                    "address.$.state": req.body.state.trim(), 
                    "address.$.pin": req.body.pin.trim()
                }
            },
            { new: true }
        );

        console.log("is updating", updatedAddress);


        res.redirect('/showAdress');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


exports.postCheckoutAddAddress = async(req,res)=>{
    try {
        let data = await addressdb.findOne({ userId: req.session.email });
        console.log(data)
        if ( data==null ) {

            console.log('ghghgghg');
            data = new addressdb({
                userId: req.session.email,
                address: [{
                    name: req.body.name.trim(),
                    CAddress: req.body.address.trim(),
                    street: req.body.street.trim(),
                    city: req.body.city.trim(),
                    state: req.body.state.trim(),
                    pin: req.body.pin
                }]
            });   
           
        }else if(data.address.length==0){
           
            data.address.push({   
            name: req.body.name.trim(),
            CAddress: req.body.address.trim(),
            street: req.body.street.trim(),
            city: req.body.city.trim(),
            state: req.body.state.trim(),
            pin: req.body.pin,
            defaultAddress: true
        });

        }
         else {
            data.address.push({
                name: req.body.name.trim(),
                CAddress: req.body.address.trim(),
                street: req.body.street.trim(),
                city: req.body.city.trim(),
                state: req.body.state.trim(),
                pin: req.body.pin.trim(),
                defaultAddress: false
            });
        }

        const userData = await data.save();
        console.log("hyyy");
        res.status(200).redirect('/checkout');
    } catch (error) {
        console.error(error);
        res.status(400).send({ success: false, msg: error.message });
    }
}



exports.defaultAddress = async (req, res) => {
    console.log(req.query.id);
    try {
        const userId = req.session.email
        const queryid = req.query.id
        const existingAddressDocument = await addressdb.findOne({
            userId: userId,
        },);

        const selectedIndex = existingAddressDocument.address.findIndex((item) => {
            return (item._id.equals(new mongoose.Types.ObjectId(queryid)))
        });
        existingAddressDocument.address.forEach((item, index) => {
            return (item.defaultAddress) = (index === selectedIndex);
        });
        const updatedData =  await existingAddressDocument.save();
        console.log(updatedData);

        res.redirect('/showAdress')
    } catch (error) {
        console.log(error);
    }
}


exports.postSaveChanges = async (req, res) => {
    console.log("llll",req.body.selectedAddress);
    try {
        const userId = req.session.email
        const queryid = req.body.selectedAddress
        const existingAddressDocument = await addressdb.findOne({
            userId: userId,
        },);

        const selectedIndex = existingAddressDocument.address.findIndex((item) => {
            return (item._id.equals(new mongoose.Types.ObjectId(queryid)))
        });
        existingAddressDocument.address.forEach((item, index) => {
            return (item.defaultAddress) = (index === selectedIndex);
        });
        const updatedData =  await existingAddressDocument.save();
        console.log(updatedData);

        res.redirect('/checkout')
    } catch (error) {
        console.log(error);
    }
}
