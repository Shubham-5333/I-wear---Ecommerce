const axios = require('axios');
const productdb = require('../model/productSchema');

const { render } = require('ejs');
const Userdb =  require('../model/userSchema')
const addressdb = require('../model/adressSchema');
const { default: mongoose, mongo } = require('mongoose');
const cartdb = require('../model/cartSchema');
const Orderdb = require('../model/orderSchema');
const walletdb = require('../model/walletSchema');
const wishlistdb = require('../model/wishlistSchema');
const couponDb = require( '../model/couponSchema' ) ;
const categorydb = require('../model/categorySchema');

exports.homePage = (req, res) => {
    const userId = req.session.email

    axios.get(`http://localhost:${process.env.PORT}/api/categoryFind?userId=${userId}`)


        .then((response) => {
            res.render('index', { category: response.data.data , product:response.data.product ,data2:response.data.wishlist});
        }).catch((err) => {
            res.status(500).redirect('/err500');
        })  

}
exports.login = (req, res) => {
    res.render('login', { errMesage: req.session.errMessage }, (err, html) => {
        if (err) {
            res.send(err)
        }
        delete req.session.errMessage
        res.send(html)
    });
}


exports.allProducts = async(req,res)=>{ 
    
    const userId = req.session.email;
    try {
        const categories = await categorydb.find()
        const product = await productdb.find()
        const wData = await wishlistdb.findOne({ userId: userId })
        res.render('allProducts',{Product:product,data2:wData,categories:categories})
    } catch (error) {
        console.log((error));
        res.status(500).redirect('/err500');
    }
}

exports.search =async(req,res)=>{
    const searchData = req.query.searchQuery;
    const userId = req.session.email;
    try {
        const regexPattern = new RegExp(searchData,'i');
        const finalGetSearch =await productdb.find({
            $or:[
                {Pname:regexPattern},
                {Pcategory:regexPattern}
            ]
        })
        const wData = await wishlistdb.findOne({ userId: userId })
        res.render('allProductsCopy',{finalGetSearch:finalGetSearch,data2:wData})
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}

exports.register = (req, res) => {
    res.render('register');
}
exports.emailForOtp = (req, res) => {
    res.render('emailForOtp');
}

exports.otpForRegister = (req, res) => {
    res.render('otp', { errorMsge: req.session.errorMsge }, (err, html) => {
        if (err) {
            res.send(err)
        }
        delete req.session.errorMsge
        res.send(html)
    });
}
exports.forgetOtp = (req, res) => {
    res.render('forgetOtp')
}



exports.userProfile = async (req, res) => {
    let userId = req.session.email
    if (typeof userId === "undefined") {
        return res.redirect('/login');
    }
    console.log(userId);
    await axios.get(`http://localhost:${process.env.PORT}/api/home?userId=${userId}`)
        .then((response) => {
            res.render('userProfile', { userEnter: response.data});
        }).catch((err) => {
            console.log(err);
            res.status(500).redirect('/err500');
        })

}


exports.categoryList = async (req, res) => {
    const userId = req.session.email;
    try {
        const id = req.query.id;
        const response = await axios.get(`http://localhost:${process.env.PORT}/api/categoryFindProduct?id=${id}`);
        
        // First axios call
        const productData = response.data;
        
        
        // Make another axios call
        const anotherResponse = await axios.get(`http://localhost:${process.env.PORT}/api/wishlistFind?id=${id}&userId=${userId}`);
        const WishData =anotherResponse.data
        console.log("yyyyyy",productData);
        console.log('jjjjjjjjjj',WishData);
      
        res.render('category', { Product: productData,data2:WishData });
    } catch (err) {
        res.status(500).redirect('/err500');
    }
};



exports.singleProduct = async (req, res) => {
    console.log("hi");
    const Id = req.query.id;
    console.log(Id);
    try {
        const finding = await productdb.findById(Id)
        console.log(finding);
        const wislist = await wishlistdb.findOne({userId:req.session.email})
        res.render('single', { singleProduct: finding ,data2:wislist}); 
    } catch (error) {
        res.status(500).redirect('/err500');
    }
}

exports.resetPass = (req, res) => {
    res.render('resetPass')
}


exports.showAddress = async (req, res) => {
    if (typeof req.session.email === "undefined") {
        return res.redirect('/login');
    }
    try {
        let data = await addressdb.aggregate([
            {
                $match: { userId: req.session.email }
            },
            {
                $unwind: "$address"
            }
        ]);
        console.log(data);
        res.render('showAdress', { data });
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/err500');
    }
};


exports.AddAddress = (req, res) => {
    res.render('AddAddress')
}

exports.editAddress = async (req, res) => {
    try {

        const addresses = await addressdb.aggregate([
            {
                $match: { userId: req.session.email },
            },
            {
                $unwind: '$address'
            },
            {
                $match: { "address._id": new mongoose.Types.ObjectId(req.query.addressId) }
            }
        ])
        console.log("id is coming", addresses[0].address);

        // if (!address) {
        //     return res.status(404).send("Address not found");
        // }

        // Render the edit address form with the existing address data
        res.render('editAddress', { ad: addresses[0].address, addId: req.query.addressId });
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/err500');
    }

}

exports.deleteAddress = async (req, res) => {
    console.log("coming in render");
    console.log("getting userId", req.body.addressId); 

    try {
        const updatedUser = await addressdb.findOneAndUpdate(
            { userId: req.session.email },
            { $pull: { address: { _id: new mongoose.Types.ObjectId(req.body.addressId) } } },
            { new: true }
        );

        console.log("is deleting", updatedUser);

       
        res.redirect('/showAdress');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/err500');
    }
};


exports.getCart = async (req, res) => {
    const userId = req.session.email; 

    if (typeof userId === "undefined") {
        return res.redirect('/login');
    }

    try {
        const cartData = await cartdb.aggregate([
            { $match: { userId: userId } },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: productdb.collection.name,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            }
        ]);
        console.log("hi",cartData);


        res.render('cart', { data: cartData });
    } catch (err) {
        res.status(500).redirect('/err500');
    }
};

exports.checkout = async(req, res) => {
    const userId = req.session.email;

    if (typeof userId === "undefined") {
        return res.redirect('/login');
    }
    try {
        const cartData = await cartdb.aggregate([
            { $match: { userId: userId } },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: productdb.collection.name,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            }
        ]);
        console.log(cartData);
        const addressData = await  addressdb.findOne({ userId: userId},)
        console.log(addressData);

        const wallet = await walletdb.findOne({userId:userId})
        const couponList = await couponDb.find()

        res.render('checkout', { data: cartData , addressData:addressData , walletInfo:wallet ,couponList:couponList,addressErr: req.session.addressErr},(err,html)=>{
            if(err){
                console.log(err);
            }
            delete req.session.addressErr;

            res.send(html)
        });
    } catch (err) {
        res.status(500).redirect('/err500');
    }
}


exports.updateProfile = async (req, res) => {
    console.log("Getting profile of", req.session.email);

    try {
        const userFind = await Userdb.findOne({
            email: req.session.email 
        });
        console.log(userFind);

        if (!userFind) {
            return res.status(404).send({ message: "User not found" });
        }

        res.render('updateProfile', { user: userFind });
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/err500');
    }
};

exports.getOrders = async (req, res) => {
    console.log("rendering orders");
    if (typeof req.session.email === "undefined") {
        return res.redirect('/login');
    }
    try {
        const userId = req.session.email;
        const orderData = await Orderdb.aggregate([
            { $match: { userId: userId } },
            { $sort: { orderDate: -1, _id: -1 }}, // Sort by orderDate and _id in descending order
            { $addFields: { 
                orderDateOnly: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                orderTime: { $substr: [{ $toString: "$orderDate" }, 11, 8] } 
            }},
            { $sort: { orderDateOnly: -1, orderTime: -1 } }, // Sort by orderDateOnly and orderTime in descending order
            { $unwind: '$orderItems' }
        ]);
        
        console.log(orderData);
        res.render('userOrders', { orders: orderData });
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/err500');
    }
};



exports.checkoutAddAddress = (req,res)=>{
    res.render('checkoutAddAddress')
}

exports.orderPlaced = (req,res)=>{
    const orderId = req.session.newOrder
    console.log("klklklklk",orderId);
    res.render('orderPlaced',{order:orderId} )
}

exports.getWallet= async (req,res)=>{
    let userId = req.session.email
    if (typeof userId === "undefined") {
        return res.redirect('/login');
    }
   try {
    const wallet =  await walletdb.findOne({ userId: userId});
     res.status(200).render('wallet',{walletInfo:wallet,walletOk:req.session.walletSuccess},(err,html)=>{
        if(err){
            console.log(err);
        }
        delete req.session.walletSuccess;

        res.status(200).send(html)
     })

   } catch (error) {
    console.log(error);
    res.status(500).redirect('/err500');
   }
}

exports.getWishlist = async(req,res)=>{
    let userId = req.session.email
    if (typeof userId === "undefined") {
        return res.redirect('/login');
    }
    try {
        const wishData =  await wishlistdb.aggregate([
            { $match: { userId: userId } },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: productdb.collection.name, // Use the name of the collection as a string
                    localField: 'products',// The field in the current document that holds the ObjectID reference
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            }
        ]);
        console.log(wishData);
        res.render('wishlist',{ wishData: wishData })
    } catch (err) {
        console.log(err);
        res.status(500).redirect('/err500');
    }
}


exports.orderDetail=async(req,res)=>{
  const orderId = req.query.orderId;
  const productId = req.query.productId;
  console.log(orderId , productId );

  try {
    const orderDetails = await Orderdb.findOne({
        _id: orderId,
        "orderItems.productId": productId
      });
      if (orderDetails) {
        const orderItem = orderDetails.orderItems.find(item => item.productId.equals(productId));
        res.render('userSingleOrder',{ order: orderDetails, product: orderItem }) ;
      } else {
        return null;
      }
    //   res.status(200).render('userSingleOrder',{data : OrderData})
  } catch (error) {
    console.log(error);
    res.status(500).redirect('/err500');
  }
}

exports.err404 =  async(req,res)=>{
    res.render('error404')
}
exports.err500 =  async(req,res)=>{
    res.render('error500')
}