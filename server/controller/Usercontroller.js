const Userdb = require('../model/userSchema');
const Otpdb = require('../model/otpSchema');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const categorydb = require('../model/categorySchema')
const productdb = require('../model/productSchema');
const addressdb = require('../model/adressSchema')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const cartdb = require('../model/cartSchema');
const Orderdb = require('../model/orderSchema');
const otpdb = require('../model/otpSchema');
const Razorpay = require('razorpay');
const walletdb = require('../model/walletSchema');
const wishlistdb = require('../model/wishlistSchema');
const couponDb = require('../model/couponSchema');

const saltRounds = 10;



const otpGenerator = () => {
    return `${Math.floor(1000 + Math.random() * 9000)}`;
};

// send mail
const sendOtpMail = async (req, res, getRoute) => {
    const otp = otpGenerator();
    console.log(otp);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS,
        },
    });

    const MailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'I WEAR',
            link: 'https://mailgen.js/',
            logo: 'I WEAR',
        },
    });

    const response = {
        body: {
            name: req.session.verifyEmail,
            intro: 'Your OTP for I WEAR verification is:',
            table: {
                data: [
                    {
                        otp: otp,
                    },
                ],
            },
            outro: '✅',
        },
    };

    const mail = MailGenerator.generate(response);

    const message = {
        from: process.env.AUTH_EMAIL,
        to: req.session.verifyEmail,
        subject: 'i wear',
        html: mail,
    };

    try {
        const newOtp = new Otpdb({
            email: req.session.verifyEmail,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60000,
        });
        const data = await newOtp.save();
        req.session.otpId = data._id;
        res.status(200).redirect('/otp');
        await transporter.sendMail(message);
    } catch (err) {
        console.log(err);
        res.status(500).redirect('/err500');
    }
};
const sendOtpMails = async (req, res, getRoute) => {
    const otp = otpGenerator();
    console.log(otp);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS,
        },
    });

    const MailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'I WEAR',
            link: 'https://mailgen.js/',
            logo: 'I WEAR',
        },
    });

    const response = {
        body: {
            name: req.session.verifyEmail,
            intro: 'Your OTP for I WEAR verification is:',
            table: {
                data: [
                    {
                        otp: otp,
                    },
                ],
            },
            outro: '✅',
        },
    };

    const mail = MailGenerator.generate(response);

    const message = {
        from: process.env.AUTH_EMAIL,
        to: req.session.verifyEmail,
        subject: 'i wear',
        html: mail,
    };

    try {
        const newOtp = new Otpdb({
            email: req.session.verifyEmail,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60000,
        });
        const data = await newOtp.save();
        req.session.otpId = data._id;
        res.status(200).redirect(getRoute);
        await transporter.sendMail(message);
    } catch (err) {
        console.log(err);
        res.status(500).redirect('/err500');
    }
};





exports.create = async (req, res) => {

    if (!req.body) {
        res.status(400).send({ message: 'empty content' });
        return;
    }

    req.session.userData = req.body;
    req.session.verifyEmail = req.body.email;

    // Hash the password using bcrypt
    try {
        // const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        // req.session.userData.password = hashedPassword;

        await sendOtpMail(req, res);
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).redirect('/err500');
    }

};




exports.otpVerify = async (req, res) => {

    const otp = await Otpdb.findOne({ email: req.session.verifyEmail });
    console.log(otp.otp);
    console.log(req.body.otp);

    if (otp.otp == req.body.otp) {
        console.log('hiii');
        const data = req.session.userData;
        console.log(data);
        console.log(data.password);
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const user = new Userdb({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        });
        console.log(user);

        await user.save();
        req.session.authentication = true;
        req.session.login = true;
        req.session.email = req.session.verifyEmail
        const d = await Userdb.updateOne({ email: req.body.email }, { $set: { status: 'Online' } });

        return res.redirect('/');

    } else {
        res.status(404).render('otp', { errorMsge: "wrong otp" })
    }
};


exports.forgotPasword = async (req, res) => {
    console.log("very");
    try {
        const email = req.body.email

        req.session.verifyEmail = req.body.email;

        await sendOtpMails(req, res, '/otpEntering')

        // res.status(200).redirect('/')
    } catch (error) {
        res.status(500).redirect('/err500');
    }
}

exports.enterOtp = async (req, res) => {

    try {
        console.log("hghjgjgj");
        const otp = await otpdb.findOne({ email: req.session.verifyEmail })
        console.log(otp);
        if (otp.otp == req.body.otp) {
            req.session.verifyFogotPassPage = true;
            res.status(200).redirect("/resetPass");
        } else {
            res.status(401).send('Wrong OTP!')
        }
    } catch (error) {
        res.status(500).redirect('/err500');
    }
}

exports.postReset = async (req, res) => {
    try {
        const reset = req.body.resetPassword;
        const confirm = req.body.confirmPassword;
        console.log("start");
        if (reset === confirm) {
            console.log("center");
            const resetData = await Userdb.updateOne({ email: req.session.verifyEmail }, { $set: { password: confirm } })
            console.log(resetData);
            res.status(200).redirect('/login')
        } else {
            res.render('resetPass', { errMess: 'Password is not matching' })
        }

    } catch (error) {
        res.status(500).redirect('/err500');
    }
}

exports.login = async (req, res) => {
    try {
        const userFind = await Userdb.findOne({ email: req.body.email });
        console.log(userFind, req.body);
        const userData = await bcrypt.compare(req.body.password, userFind.password)
        if (userData) {
            req.session.authentication = true;
            req.session.login = true;
            req.session.email = req.body.email;
            const d = await Userdb.updateOne({ email: req.body.email }, { $set: { status: 'Active' } });
            res.redirect('/');
        } else {
            res.render('login', { errorMessage: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).redirect('/err500');
    }
};



exports.logout = async (req, res) => {
    try {
        await Userdb.findOneAndUpdate({ email: req.session.email }, { $set: { status: "Inactive" } });
        req.session.destroy();
        res.status(200).redirect("/");
    } catch (error) {
        console.log(error)
        res.status(500).redirect('/err500');
    }
};


exports.userProfileEnter = async (req, res) => {
    console.log("hjhjhjh");
    const id = req.query.userId
    console.log(id);
    try {
        const data = await Userdb.findOne({ email: id })
        res.send(data)
        console.log(data);

    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}









exports.findCategory = async (req, res) => {
    const userId = req.query.userId
    try {
        const data = await categorydb.find({ action: false })
        const pData = await productdb.find({ action: false })
        const wData = await wishlistdb.findOne({ userId: userId })

        console.log(data);
        res.send({ data: data, product: pData, wishlist: wData });
    } catch (error) {
        res.send(error)
        res.status(500).redirect('/err500');
    }
}

exports.findCategoryProduct = async (req, res) => {
    const name = req.query.id
    console.log("llllllllllll", name);
    try {
        const data = await productdb.find({ Pcategory: name })
        console.log(data);
        res.send(data)
    } catch (error) {
        res.status(500).redirect('/err500');
    }
}
exports.wishlistFind = async (req, res) => {

    const userId = req.query.userId;
    try {
        const wData = await wishlistdb.findOne({ userId: userId })

        console.log(wData);
        res.send(wData)

    } catch (error) {
        res.status(500).redirect('/err500');
    }
}

// exports.singleProductFind=async(req,res)=>{
//     console.log(" coming");
//     const name=req.query.id
//     console.log(name);
//    try {
//      const data=  await productdb.find({_id:name})
//      console.log(data);
//      res.send(data)
//    } catch (error) {
//        res.send(error)
//    }
// }


exports.nameUpdate = async (req, res) => {
    const name = req.body.newName.trim()

    try {
        const userFind = await Userdb.findOneAndUpdate(
            { email: req.session.email },
            { $set: { name: name } },
            { new: true }
        );

        if (!userFind) {
            return res.status(404).send({ message: "User not found" });
        }

        res.redirect('/userProfile');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/err500');
    }
}



exports.postingOrder = async (req, res) => {
    if (typeof req.session.email === "undefined") {
        return res.redirect('/login');
    }

    try {
        const walletInfo = await walletdb.findOne({ userId: req.session.email })

        const [data] = await addressdb.aggregate([
            { $match: { userId: req.session.email } },
            { $unwind: "$address" },
            { $match: { "address.defaultAddress": true } },
            {
                $project: {
                    _id: "$address._id",
                    name: "$address.name",
                    CAddress: "$address.CAddress",
                    street: "$address.street",
                    city: "$address.city",
                    state: "$address.state",
                    pin: "$address.pin",
                    userId: "$userId"
                }
            },
        ]);
    


        const cartProducts = await cartdb.aggregate([
            { $match: { userId: req.session.email } },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: productdb.collection.name,
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' }
        ]);

        let subtotal = cartProducts.reduce((total, item) => {
            return total + parseInt(item.productDetails.price * item.products.quantity);
        }, 0);
        if(req.session.totalPrice){
            subtotal = req.session.totalPrice
            console.log("now total",subtotal);
        }

        const orderItems = cartProducts.map((element) => {
            const order = {
                productId: element.products.productId,
                images: element.productDetails.images[0],
                Pname: element.productDetails.Pname,
                Pcategory: element.productDetails.Pcategory,
                price: element.productDetails.price,
                units: element.products.quantity,
                Pdescription: element.productDetails.description
            };
            if (req.session.appliedCouponCode) {
                const totalUnitPrice = order.price * order.units
                const afterDiscountPrice = Math.round(totalUnitPrice - ((totalUnitPrice * req.session.couponDiscount) / 100))
                order.priceAfterCoupon = afterDiscountPrice
                order.couponCode = req.session.appliedCouponCode
              }
              return order
        });

        orderItems.forEach(async (element) => {
            await productdb.updateOne(
                { _id: element.productId },
                { $inc: { units: -element.units } }
            );
        })

        const newOrder = new Orderdb({
            userId: req.session.email,
            orderItems: orderItems,
            totalPrice: subtotal,
            address: data,
            paymentMethod: req.body.paymentMethod === "cod" ? "cod"
                : req.body.paymentMethod === "onlinePayment"
                    ? "onlinePayment"
                    : "wallet" ?? "wallet",
        });
       const nr = await newOrder.save()
       console.log("okkkkkkkkkkkkkkkk",nr);

        if (req.body.paymentMethod === "cod") {
            await newOrder.save();
            req.session.newOrder = newOrder;
            delete req.session.totalPrice;

            await cartdb.updateOne(
                { userId: req.session.email },
                { $set: { products: [] } }
            );
            req.session.orderSuccessPage = true;
            return res.status(200).json({
                success: true,
                url: "/orderPlaced",
                paymentMethod: "cod",
            });;
        }


        if (req.body.paymentMethod === "wallet") {
            if (walletInfo && walletInfo.balance >= subtotal) {
                await newOrder.save();
                req.session.newOrder = newOrder;
                delete req.session.totalPrice;
                await cartdb.updateOne(
                    { userId: req.session.email },
                    { $set: { products: [] } }
                );
                await walletdb.updateOne(
                    { userId: req.session.email },
                    { $inc: { balance: -(subtotal) }, 
                    $push: {transactions: {amount: -(subtotal)} } },
                    { upsert: true }
                );
                req.session.orderSucessPage = true;
                res.json({
                    success: true,
                    paymentMethod: "wallet",
                    url: "/orderPlaced",
                });
            }
        }


        if (req.body.paymentMethod === "onlinePayment") {
            const razorpayInstance = new Razorpay({
                key_id: process.env.key_id,
                key_secret: process.env.key_secret
            });
            const amount = subtotal * 100;

            const options = {
                amount,
                currency: "INR",
                receipt: "" + newOrder._id,
            };

            const order = await razorpayInstance.orders.create(options);

            req.session.newOrder = newOrder;
            console.log(order);


            return res.status(200).json({
                success: true,
                msg: 'order created',
                key_id: process.env.key_id,
                order: order,
                paymentMethod: "onlinePayment"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}


exports.orderSuccessful = async (req, res) => {
    try {
        console.log(req.body);
        const crypto = require("crypto");

        const hmac = crypto.createHmac("sha256", process.env.key_secret);
        hmac.update(
            req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id
        );
        const isValid = hmac.digest("hex") === req.body.razorpay_signature;

        if (isValid) {            
            const newOrder = await Orderdb.findById(req.session.newOrder);
            
            delete req.session.totalPrice;
            await cartdb.updateOne(
                { userId: req.session.email },
                { $set: { products: [] } }
            );
            function updateOrderStatus(originalOrder, newStatus) {
                originalOrder.orderItems.forEach((item) => {
                  item.orderStatus = newStatus;
                });
              }
            updateOrderStatus(newOrder, "ordered") 
            const ko = await newOrder.save();


            console.log("dfsfsfsfsdfssf",ko);

            req.session.orderSucessPage = true;
            return res.status(200).redirect("/orderPlaced");
        } else {
            console.log("endu kondu");
            res.status(200).send("Invalid Signature");
        }
    } catch (err) {
        console.error("order razorpay err", err);
        res.status(500).redirect('/err500');
    }
}

exports.addWalletMoney = async (req, res) => {
    console.log(req.body.amount);
    const razorpayInstance = new Razorpay({
        key_id: process.env.key_id,
        key_secret: process.env.key_secret
    });

    try {
        req.session.walletAmount = req.body.amount;
        const amount = Number(req.body.amount) * 100
        const options = {
            amount: amount,
            currency: "INR",
            receipt: "wallet",
        };

        const wallet = await razorpayInstance.orders.create(options);

        return res.status(200).json({
            success: true,
            msg: 'money sucessfully added',
            key_id: razorpayInstance.key_id,
            wallet: wallet
        })

    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}

exports.addWalletMoneySuccessful = async (req, res) => {
    try {
        const crypto = require("crypto");

        const hmac = crypto.createHmac("sha256", process.env.key_secret);
        hmac.update(
            req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id
        );

        if (hmac.digest("hex") === req.body.razorpay_signature) {
            await walletdb.updateOne({ userId: req.session.email }, { $inc: { balance: req.session.walletAmount } }, { upsert: true })
            const w = await walletdb.findOneAndUpdate({ userId: req.session.email },
                {
                    $push: {
                        'transactions': {
                            amount: req.session.walletAmount,
                        }
                    }
                })
            req.session.walletSuccess = true;
            return res.status(200).redirect("/wallet");

        } else {
            return res.send("adding Failed");
        }
    } catch (err) {
        console.error("add razorpay err", err);
        res.status(500).redirect('/err500');
    }
}

exports.addWishlist = async (req, res) => {
    if (typeof req.session.email === "undefined") {
        return res.redirect('/login');
    }
    console.log("lllllllllllllllll", req.body.productId);
    try {
        const productId = req.body.productId;
        const userId = req.session.email;

        const product = await productdb.findOne({ _id: productId })
        if (!product) {
            res.send("there is no such product")
        }

        await wishlistdb.updateOne({ userId: userId }, { $push: { products: productId } }, { upsert: true });
        res.status(200).json({
            success: true,
            message: 'Item added to Wishlist'
        });

    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}

exports.removeWishlist = async (req, res) => {
    if (typeof req.session.email === "undefined") {
        return res.redirect('/login');
    }
    console.log(req.body.productId);
    try {
        const productId = req.body.productId;
        const userId = req.session.email;


        await wishlistdb.updateOne({ userId: userId }, { $pull: { products: productId } });
        res.status(200).json({
            success: true,
            message: 'Item removed from Wishlist'
        });
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}
exports.deleteFromWishlist = async (req, res) => {
    if (typeof req.session.email === "undefined") {
        return res.redirect('/login');
    }

    try {
        const productId = req.query.productId;
        const userId = req.session.email;


        await wishlistdb.updateOne({ userId: userId }, { $pull: { products: productId } });
        res.status(200).redirect('/wishlist')
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}

exports.couponApply = async (req, res) => {
    const userId = req.session.email;
    try {
        const couponCode = req.query.code.toUpperCase().trim();
        console.log("cpn/code getting", couponCode);
        const coupon = await couponDb.findOne({ code: couponCode })

        const cartProducts = await cartdb.aggregate([
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
        console.log(cartProducts);

        const total = cartProducts.reduce((total, value) => {
            return total += Math.round((value.productDetails.price * value.products.quantity));
        }, 0);
        console.log("total why",total);
        
        
        const currentDate = new Date();
        if(!coupon){
            const wrong = "invalid coupon"
            res.status(200).json({error:wrong})
        }
        if (coupon) {
            if (coupon.expiry < currentDate) {
                const exp = 'Coupon expired !';
                res.status(200).json({ error: exp });
            } else if (coupon.minPrice > total) {
                const min = `Minimum purchase price is ${coupon.minPrice}`;
                res.status(200).json({ error: min });
            } else {
                req.session.appliedCouponCode = coupon.code;
                const discount = parseInt(total * (coupon.discount / 100));
                console.log(discount);
                const afterCoupon = parseInt(total - discount);
                console.log(afterCoupon);
                req.session.totalPrice = afterCoupon;
                req.session.couponDiscount = coupon.discount;
                res.status(200).json({ afterCoupon: afterCoupon, discount: discount });
            }
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}


exports.retryPayment = async(req,res)=>{
    // console.log("yayayyayay",,req.body.orderId,);
    const queryPaymentMethod  = req.body.paymentMethod;
    const queryOrderId = req.body.orderId;
    try {
        if (queryPaymentMethod === "cod") {
            console.log("yes enetring");
            const orderFind = await Orderdb.findById(queryOrderId)
            // req.session.newOrder = newOrder;
            delete req.session.totalPrice;
            function updateOrderStatus(originalOrder, newStatus) {
                originalOrder.orderItems.forEach((item) => {
                  item.orderStatus = newStatus;
                });
              }

              updateOrderStatus(orderFind, "ordered") 
              const ko = await orderFind.save();


            console.log("dfsfsfsfsdfssf",ko);
            await cartdb.updateOne(
                { userId: req.session.email },
                { $set: { products: [] } }
            );
            req.session.orderSuccessPage = true;
            return res.status(200).json({
                success: true,
                url: "/orderPlaced",
                paymentMethod: "cod",
            });;
        }


        if (req.body.paymentMethod === "wallet") {
            if (walletInfo && walletInfo.balance >= subtotal) {
                await newOrder.save();
                req.session.newOrder = newOrder;
                delete req.session.totalPrice;
                await cartdb.updateOne(
                    { userId: req.session.email },
                    { $set: { products: [] } }
                );
                await walletdb.updateOne(
                    { userId: req.session.email },
                    { $inc: { balance: -(subtotal) }, 
                    $push: {transactions: {amount: -(subtotal)} } },
                    { upsert: true }
                );
                req.session.orderSucessPage = true;
                res.json({
                    success: true,
                    paymentMethod: "wallet",
                    url: "/orderPlaced",
                });
            }
        }


        if (queryPaymentMethod === "online") {
            console.log("yes enetring");
            const orderFind = await Orderdb.findById(queryOrderId)
            const razorpayInstance = new Razorpay({
                key_id: process.env.key_id,
                key_secret: process.env.key_secret
            });
            const amount = orderFind.totalPrice * 100;

            const options = {
                amount,
                currency: "INR",
                receipt: "" + orderFind._id,
            };

            const order = await razorpayInstance.orders.create(options);

            // req.session.newOrder = newOrder;
            console.log(order);


            return res.status(200).json({
                success: true,
                msg: 'order created',
                key_id: process.env.key_id,
                order: order,
                paymentMethod: "onlinePayment"
            });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}

