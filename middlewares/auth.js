const Userdb = require("../server/model/userSchema");
const orderdb = require('../server/model/orderSchema')
const cartdb = require('../server/model/cartSchema')

exports.isLogin = (req, res, next) => {
    if (req.session.login) {
        res.redirect('/')
    } else {
        next();
    }
}

exports.LoginOrNot = (req, res, next) => {
    if (!req.session.login) {
        res.redirect('/')
    } else {
        next()
    }
}
exports.userProfile = (req, res, next) => {
    if (req.session.authentication == true) {
        res.redirect('/userProfile')
    } else {
        next()
    }
}
exports.isAdminAuth = (req, res, next) => {
    if(req.session.isAdminAuth){
        next();
    }else{
        res.status(401).redirect('/admin/login');
    }
},

exports.noAdminAuth = (req, res, next) => {
    if(req.session.isAdminAuth){
        res.status(401).redirect('/admin/home');
    }else{
        next();
    }
}
exports.isBlocked = async (req, res, next) => {
    try {
        let AllUser = await Userdb.findOne({ email: req.session.email });
        if (AllUser && AllUser.action !== null) {
            if (AllUser.action === true) {
                res.render('login', { errorMessage: "Account blocked temporarily" })
            } else {
                next()
            }
        } else {
            next()
        }

    } catch (error) {
        console.log(error)
    }
}

exports.userCheck = async (req, res, next) => {
    try {
        const userData = await Userdb.findOne({ email: req.body.email })

        if (userData) {
            // User with the same email already exists
            res.render('register', { message: "User already exist" });
        } else {
            // User does not exist, proceed to the next middleware or route handler
            next();
        }
    } catch (error) {
        console.log(error);
        // Handle the error as needed
        res.status(500).send({ message: "Internal server error" });
    }
};


exports.emptyCart=async(req,res,next)=>{
    let cartItems=await cartdb.find({userId:req.session.email});
    console.log(cartItems);
    console.log(cartItems.length);
    if(cartItems.length==0 ){
        res.redirect('/')
    }else if(cartItems[0].products.length==0){
       res.redirect('/')
        
    }else{
        next()
    }
}


