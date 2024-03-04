const express = require("express")
const route = express.Router();
const services = require('../services/adminRender')
const AdminController = require('../controller/AdminController')
const auth = require('../../middlewares/auth')
const multerAuth = require("../../middlewares/multer")
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController');
const orderController = require('../controller/orderController')




route.get("/home",auth.isAdminAuth,services.AdminHome)

route.get('/login',auth.noAdminAuth,services.AdminLogin)
route.post('/postLogin',AdminController.Adminlogin)

route.post('/adminLogout',AdminController.Adminlogout)

route.get('/productManagement',auth.isAdminAuth,services.ProductManagement)
// route.get('/categoryManagement',services.CatergoryManagement)
route.get('/addCategory',auth.isAdminAuth,services.addCategory)
route.post('/postAddCategory',auth.isAdminAuth,categoryController.addingCategory)

route.get('/getAllCategory',auth.isAdminAuth,categoryController.getAllCategories)

route.get('/editCategory/:id',auth.isAdminAuth,categoryController.editCategory)

route.post('/postEditCategory/:id',auth.isAdminAuth,categoryController.postEditCategory)

route.post('/adminAction/unlist/:id',categoryController.unlistCategory)
route.post('/adminAction/list/:id',categoryController.listCategory)

// route.post(/adprduct)

route.get('/userManagement',auth.isAdminAuth,AdminController.UserManagement)


// route.post('/adminUserStatus/:id/:ind',AdminController.blockUser)
route.post('/adminUserStatus/block/:id',AdminController.blockUser)
route.post('/adminUserStatus/unblock/:id',AdminController.unblockUser)




route.get('/addProduct',auth.isAdminAuth,services.addProduct)
route.post('/uploadImage',multerAuth.array('image',4),productController.postAddProduct)

// route.get('/getAllProduct',productController.getAllProducts)

route.get('/editProduct',multerAuth.array('image',4),auth.isAdminAuth,services.editProduct)
route.post('/editProduct',multerAuth.array('image',4),productController.updateProduct)
route.post('/editProduct/:productId/deleteImage/:imageIndex',productController.deleteImage)
// route.post( '/editProduct/:productId/deleteImage/:imageIndex', productController.deleteProduct )


route.post('/adminActionProduct/unlist/:id',productController.unlistProduct)
route.post('/adminActionProduct/list/:id',productController.listProduct)





// route.get('/admin/addProduct',productController.findCategory)

route.get('/editProduct',auth.isAdminAuth,services.editProduct)
// route.get('/admin/editProduct',productController.findCategory)

route.get('/orderManagement',auth.isAdminAuth,services.orderManagement)

route.post('/adminChangeOrderStatus',orderController.adminChangeOrderStatus)



// dashboard

route.get('/downloadSalesReport',AdminController.downloadSalesReport);

route.get('/dailyReportDownload',AdminController.dailyReport)
route.get('/weeklyReportDownload',AdminController.weeklyReport)
route.get('/monthlyReportDownload',AdminController.monthlyReport)
route.get('/yearlyReportDownload',AdminController.yearlyReport)

//coupon
route.get('/couponManagement',auth.isAdminAuth,services.getCouponManagement)
route.get('/addCoupon',services.addCoupon)
route.post('/postAddCoupon',AdminController.addCoupon)
route.get('/deleteCoupon',AdminController.deleteCoupon)

route.post('/chartData',AdminController.getDetailsChart)




module.exports = route
