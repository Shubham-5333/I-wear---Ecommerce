const express = require("express")
const route = express.Router()
const services=require('../services/userRender')
const controller = require('../controller/Usercontroller')
const auth = require('../../middlewares/auth')
const adController = require('../controller/addressController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')




route.get("/",auth.isBlocked,services.homePage)
route.get('/login',auth.userProfile,auth.isLogin,auth.isBlocked,services.login)
route.get('/register',services.register)

route.get('/otp',services.otpForRegister)
route.post('/api/verifyOtp',controller.otpVerify)


route.get('/emailForOtp',services.emailForOtp)
route.post('/verifyEmailOtp',controller.forgotPasword)  

route.get('/otpEntering',services.forgetOtp)
route.post('/postEnterOtp',controller.enterOtp)





route.post('/api',controller.login)

route.get('/logout',controller.logout)

route.post('/api/registartion',auth.userCheck,controller.create)

// axios

route.get('/api/categoryFind',controller.findCategory)

route.get('/categoryList',services.categoryList)
route.get('/api/categoryFindProduct',controller.findCategoryProduct)
route.get('/api/wishlistFind',controller.wishlistFind)

route.get('/ListSingleProduct',services.singleProduct)

route.get('/search',services.search);


route.get('/allProducts',services.allProducts)

route.get('/resetPass',services.resetPass)
route.post('/postResetPass',controller.postReset)

route.get('/userProfile',auth.isBlocked, services.userProfile);
route.get('/api/home', controller.userProfileEnter);


route.get('/showAdress',services.showAddress)

route.get('/AddAdress',services.AddAddress)

route.post('/postAddress',adController.AddAddress)

route.get('/editAddress',services.editAddress)

route.post('/postEditAddress',adController.postEditAddress)

route.post('/deleteAddress', services.deleteAddress); 

route.post('/defaultAddress',adController.defaultAddress)

route.post('/saveChanges',adController.postSaveChanges)

route.get('/cart',auth.isBlocked,services.getCart)

route.post('/postCart',cartController.postCart)

route.post('/deleteCart',cartController.deleteCart)

route.get('/checkoutAddAddress',services.checkoutAddAddress)
route.post('/postCheckoutAddAddress',adController.postCheckoutAddAddress)

route.get('/checkout',auth.isBlocked,auth.emptyCart,services.checkout)

route.get('/updateProfile',services.updateProfile)

route.post('/updateName',controller.nameUpdate)

route.post('/updateQuantity',cartController.updateQuantity)


route.post('/postingOrder',controller.postingOrder)

route.get('/orderPlaced',services.orderPlaced)

route.post('/ordersuccefull',controller.orderSuccessful)



route.get('/getOrders',services.getOrders)

route.get('/cancelOrder',orderController.cancelOrder)
route.get('/returnOrder',orderController.returnOrder)


route.get('/wallet',services.getWallet)
route.post('/addWalletMoney',controller.addWalletMoney)
route.post('/addedMoney',controller.addWalletMoneySuccessful)

route.get('/wishlist',auth.isBlocked,services.getWishlist)

route.post('/wishlist/add',controller.addWishlist)
route.post('/wishlist/remove',controller.removeWishlist)
route.post('/deleteFromWishlist',controller.deleteFromWishlist)


route.get('/applyCouponCode',controller.couponApply)

route.get('/invoice',orderController.invoice)


route.get('/singleOrder',services.orderDetail)

route.post('/retryPayment',controller.retryPayment)



// route.post('/')?


module.exports = route