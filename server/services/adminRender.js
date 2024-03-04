const axios = require('axios')
const productdb = require('../model/productSchema');

const categorydb = require('../model/categorySchema')
const Orderdb = require('../model/orderSchema');
const Userdb = require('../model/userSchema');
const coupenDb = require('../model/couponSchema');
exports.AdminLogin = (req, res) => {
    res.render('adminLogin');
}
exports.AdminHome = async (req, res) => {
    try {
        const userCount = await Userdb.countDocuments();
        const orderCount = await Orderdb.countDocuments();
        const [salesCount] = await Orderdb.aggregate([
            { $unwind:{
                path: '$orderItems' 
            }
        },
            {
                $match: {
                    "orderItems.orderStatus": 'Delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    profit: {
                        $sum: {
                            $multiply: [
                                { $toDouble: "$orderItems.price" },
                                { $toInt: "$orderItems.units" } // Assuming units should be integer
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    profit: 1
                }
            }
        ]);
        console.log("llllll",salesCount);
        
        

        const topProducts = await Orderdb.aggregate([
            { $unwind: { path: '$orderItems' } },
            { "$group": { _id: "$orderItems.productId", productName: { $first: '$orderItems.Pname' }, totalUnitsSold: { "$sum": "$orderItems.units" } } },
            { $project: { _id: 0, productName: 1, totalUnitsSold: 1 } },
            { $sort: { totalUnitsSold: -1 } },
            { $limit: 10 }
        ])
        console.log(topProducts);
        const topCategory = await Orderdb.aggregate([
            { $unwind: '$orderItems' },
            { $group: { _id: '$orderItems.Pcategory', totalUnitsSold: { $sum: '$orderItems.units' } } },
            { $project: { _id: 0, _id: 1, totalUnitsSold: 1 } },
            { $sort: { totalUnitsSold: -1 } },
            { $limit: 10 }
        ])
        console.log(topCategory);

        res.status(200).render('adminIndex', { count: userCount, orders: orderCount, salesCount:salesCount, topProducts: topProducts, topCategory: topCategory });
    } catch (error) {
        console.log("Error counting users:", error);
        res.status(500).send("Internal server error");
    }

}

exports.ProductManagement = async (req, res) => {
    const product = await productdb.find();
    console.log(product);
    res.render('ProductManagement', { product: product });
}

exports.addProduct = async (req, res) => {
    const finddb = await categorydb.find({ action: false })
    console.log(finddb);
    res.render('addProductPage', { category: finddb })
}
// exports.CatergoryManagement=(req,res)=>{
//     res.render('CategoryMangement');
// }

exports.editProduct = async (req, res) => {
    try {
        const product = await productdb.find({ _id: req.query.id });
        const categories = await categorydb.find();
        res.render('editProductPage', { product, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


exports.addCategory = (req, res) => {
    res.render('addCategory', { errMessage: req.session.errMessage }, (error, html) => {
        if (error) {
            res.status(500).send({ error: "error in server" })
        }
        delete req.session.errMessage;
        res.send(html)
    })
}

exports.orderManagement = async (req, res) => {
    console.log("rendering orders in admin");
    try {
        const orderData = await Orderdb.aggregate([
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'userdbs',
                    localField: 'userId',
                    foreignField: 'email',
                    as: 'userInfo'
                }
            },
            { $sort: { orderDate: -1 } }
        ]);

        console.log(orderData);
        res.render('orderManagement', { orders: orderData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// exports.countUsers = async (req, res) => {
//     try {
//         const userCount = await Userdb.countDocuments();
//         res.status(200).rediect({ count: userCount });
//     } catch (error) {
//         console.log("Error counting users:", error);
//         res.status(500).send( "Internal server error" );
//     }
// }

exports.getCouponManagement = async (req, res) => {
    try {
        const couponData = await coupenDb.find()
        res.render('couponManagement', { couponData })
    } catch (error) {

    }
}

exports.addCoupon = (req, res) => {
    res.render('addCoupon', { cpnErr: req.session.cpnErr }, (error, html) => {
        if (error) {
            res.status(500).send({ error: "error in server" })
        }
        delete req.session.cpnErr;
        res.send(html)
    })
}






