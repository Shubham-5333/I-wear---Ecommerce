// const UserManagedb = require('../model/AdminUserSchema');
const Orderdb = require('../model/orderSchema');
const Userdb = require('../model/userSchema');
const PDFDocument = require("pdfkit-table")
const couponDb = require('../model/couponSchema');


const admincred = {
    adminemail: "admin@gmail.com",
    adminpass: "123"
};



exports.Adminlogin = async (req, res) => {
    try {
        if (req.body.email === admincred.adminemail && req.body.password === admincred.adminpass) {
            console.log("Admin login successful");
            req.session.isAdminAuth = true;
            res.redirect('/admin/home');
        } else {
            console.log("wrong adminCred");
            res.redirect('/admin/login');
        }
    } catch (err) {
        res.status(500).redirect('/err500');
    }
}

exports.UserManagement = async (req, res) => {
    try {
        const userData = await Userdb.find();
        console.log(userData);
        res.render('UserManagement', { user: userData });
    } catch (err) {
        console.log(err);
        res.status(500).redirect('/err500');
    }
}

exports.blockUser = async (req, res) => {
    try {
        let userId = req.params.id;
        let user = await Userdb.findOneAndUpdate({ _id: userId }, { $set: { action: true } })
        console.log(user);
        res.redirect('/admin/userManagement')
    } catch (error) {
        res.status(500).redirect('/err500');
    }
}

exports.unblockUser = async (req, res) => {
    try {
        let userId = req.params.id;
        let user = await Userdb.findOneAndUpdate({ _id: userId }, { $set: { action: false } })
        console.log(user);
        res.redirect('/admin/userManagement')
    } catch (error) {
        res.status(500).redirect('/err500');
    }
}



exports.Adminlogout = async (req, res) => {
    try {
        req.session.destroy()
        console.log("admin logged out");
        res.status(200).redirect("/admin/login");
    } catch (error) {
        console.log(error)
        res.status(500).redirect('/err500');
    }
}


// exports.downloadSalesReport = async (req, res) => {
//     console.log("from:", req.query.fromDate, "to:", req.query.toDate);
//     try {
//         const fromDate = req.query.fromDate;
//         const toDate = new Date(req.query.toDate).setUTCHours(23, 59, 59, 999);

//         const result = await Orderdb.aggregate([
//             { $unwind: "$orderItems" },
//             {
//                 $match: { orderDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
//             },
//             { $sort: { orderDate: -1 } },
//         ]);

//         const users = [];
//         count =0;
//         let total = 0;
//         result.forEach((orders) => {
//             orders.sI = count;
//             const orderTotal = orders.orderItems.units * orders.orderItems.price;
//             total += orderTotal; // Adding to the total
//             console.log("ok kitti", orderTotal);
//             console.log(total);
//             users.push({
//                 SI: orders.sI,
//                 "Orders ID": orders._id,
//                 "Order Date": orders.orderDate.toISOString().split("T")[0],
//                 "Product Name": orders.orderItems.Pname,
//                 "Price of a unit": orders.orderItems.price,
//                 "Qty": orders.orderItems.units,
//                 "Payment Method": orders.paymentMethod,
//                 "Total amount": orderTotal, // Individual order total
//             });
//             count++;
//         });

//         // Push total to users array outside of the loop
//         users.push({ "Total": total });

//         // Convert to CSV
//         const csvFields = [
//             "SI",
//             "Orders ID",
//             "Order Date",
//             "Product Name",
//             "Price of a unit",
//             "Qty",
//             "Payment Method",
//             "Total amount",
//         ];
//         const { Parser } = require('json2csv');
//         const csvParser = new Parser({ fields: csvFields });
//         let csvData = csvParser.parse(users);

//         // Send CSV response
//         res.setHeader("Content-Type", "text/csv");
//         res.setHeader("Content-Disposition", "attachment; filename=salesReport.csv");
//         res.send(csvData);

//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Internal server error");
//     }
// };

exports.downloadSalesReport = async (req, res) => {

    try {
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate
        const customOrders = await Orderdb.find({
            $and: [
                {
                    orderDate: {
                        $gte: fromDate,
                        $lt: toDate
                    },
                },
                {
                    "orderItems.orderStatus": 'Delivered'
                }
            ]

        });


        const doc = new PDFDocument();


        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="daily_sales_report.pdf"');


        doc.pipe(res);


        doc.fontSize(12).text('I WEAR', { align: 'center' }).moveDown();


        const tableHeaders = ['Order Date', "User's Name", 'Address', 'Product Name', 'Category', 'Order Status', 'Price'];

        let totalPrice = 0;
        const tableData = [];

        customOrders.forEach(order => {
            order.orderItems.forEach(item => {
                tableData.push([
                    order.orderDate.toDateString(),
                    order.address.name,
                    `${order.address.CAddress
                    }, ${order.address.street}, ${order.address.city}, ${order.address.pin}`,
                    item.Pname || 'N/A',
                    item.Pcategory || 'N/A',
                    item.orderStatus || 'N/A',
                    order.totalPrice !== undefined ? order.totalPrice : 'N/A'
                ]);
                totalPrice += Number(order.totalPrice) || 0;
            });
        });
        tableData.push(['Total Price', '', '', '', '', '', totalPrice]);


        const tableOptions = {
            headers: tableHeaders,
            rows: tableData
        };


        doc.table(tableOptions);


        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }

}



//daily 
exports.dailyReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);


        const dailyOrders = await Orderdb.find({
            $and:[
                {
                    orderDate: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }    
                },
                {
                    "orderItems.orderStatus": 'Delivered'
                }
            ]
            
        });

        const doc = new PDFDocument();


        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="daily_sales_report.pdf"');


        doc.pipe(res);


        doc.fontSize(12).text('I WEAR', { align: 'center' }).moveDown();


        const tableHeaders = ['Order Date', "User's Name", 'Address', 'Product Name', 'Category', 'Order Status', 'Price'];

        let totalPrice = 0;
        const tableData = [];

        dailyOrders.forEach(order => {
            order.orderItems.forEach(item => {
                tableData.push([
                    order.orderDate.toDateString(),
                    order.address.name,
                    `${order.address.CAddress
                    }, ${order.address.street}, ${order.address.city}, ${order.address.pin}`,
                    item.Pname || 'N/A',
                    item.Pcategory || 'N/A',
                    item.orderStatus || 'N/A',
                    order.totalPrice !== undefined ? order.totalPrice : 'N/A'
                ]);
                totalPrice += Number(order.totalPrice) || 0;
            });
        });
        tableData.push(['Total Price', '', '', '', '', '', totalPrice]);


        const tableOptions = {
            headers: tableHeaders,
            rows: tableData
        };


        doc.table(tableOptions);


        doc.end();

    } catch (error) {
        console.error("Error generating daily sales report:", error);
        res.status(500).redirect('/err500').json({ error: "Internal server error" });
    }
}

// weekly
exports.weeklyReport = async (req, res) => {
    try {
        const startDate = new Date()
        const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)


        const weeklyOrders = await Orderdb.find({
            $and:[
                {
                    orderDate: {
                        $gte: endDate,
                        $lt: startDate
                    }
                },
                {
                    "orderItems.orderStatus": 'Delivered'
                }
            ]
            
        });

        const tableHeaders = ['Order Date', "User's Name", 'Address', 'Product Name', 'Category', 'Order Status', 'Price'];
        let totalPrice = 0;
        const tableData = [];

        weeklyOrders.forEach(order => {
            order.orderItems.forEach(item => {
                tableData.push([
                    order.orderDate.toDateString(),
                    order.address.name,
                    `${order.address.CAddress
                    }, ${order.address.street}, ${order.address.city}, ${order.address.pin}`,
                    item.Pname || 'N/A',
                    item.Pcategory || 'N/A',
                    item.orderStatus || 'N/A',
                    order.totalPrice !== undefined ? order.totalPrice : 'N/A',

                ])
                totalPrice += Number(order.totalPrice) || 0; // Update total price
            })
        })
        tableData.push(['Total Price', '', '', '', '', '', totalPrice]);

        const table = {
            title: 'Weekly Sales Report',
            headers: tableHeaders,
            rows: tableData
        }


        let doc = new PDFDocument('I WEAR', { margin: 30, size: 'A4' })


        await doc.table(table)


        const pdfChunks = []
        doc.on('data', chunk => {
            pdfChunks.push(chunk)
        });
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(pdfChunks)

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="weekly_sales_report.pdf"')

            res.send(pdfBuffer);
        });
        doc.end()
    } catch (error) {
        console.error("Error generating weekly sales report:", error)
        res.status(500).redirect('/err500').json({ error: "Internal server error" })
    }
}

// monthly 
exports.monthlyReport = async (req, res) => {
    try {
        const currentDate = new Date();
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthlyOrders = await Orderdb.find({
            $and:[
                {
                    orderDate: {
                        $gte: startDate,
                        $lte: endDate
                    }
                },
                {
                    "orderItems.orderStatus": 'Delivered'
                }
            ]   
        });

        const tableHeaders = ['Order Date', "User's Name", 'Address', 'Product Name', 'Category', 'Order Status', 'Price'];
        let totalPrice = 0;
        const tableData = [];

        monthlyOrders.forEach(order => {
            order.orderItems.forEach(item => {
                tableData.push([
                    order.orderDate.toDateString(),
                    order.address.name,
                    `${order.address.CAddress}, ${order.address.street}, ${order.address.city}, ${order.address.pin}`,
                    item.Pname || 'N/A',
                    item.Pcategory || 'N/A',
                    item.orderStatus || 'N/A',
                    order.totalPrice !== undefined ? order.totalPrice : 'N/A',
                ]);
                totalPrice += Number(order.totalPrice) || 0; // Update total price
            });
        });

        tableData.push(['Total Price', '', '', '', '', '', totalPrice]);

        const table = {
            title: 'Monthly Sales Report',
            headers: tableHeaders,
            rows: tableData
        };

        let doc = new PDFDocument('I WEAR', { margin: 30, size: 'A4' });

        await doc.table(table);

        const pdfChunks = [];
        doc.on('data', chunk => {
            pdfChunks.push(chunk);
        });
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(pdfChunks);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="monthly_sales_report.pdf"');
            res.send(pdfBuffer);
        });
        doc.end();
    } catch (error) {
        console.error("Error generating monthly sales report:", error);
        res.status(500).redirect('/err500').json({ error: "Internal server error" });
    }
};



// yearly 
exports.yearlyReport = async (req, res) => {
    try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1);

        const yearlyOrders = await Orderdb.find({
            $and: [
                {
                    orderDate: {
                        $gte: startOfYear,
                        $lt: endOfYear
                    }
                },
                {
                    "orderItems.orderStatus": 'Delivered'
                }
            ]
        });

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="yearly_sales_invoice.pdf"');

        doc.pipe(res);

        // Title
        doc.fontSize(24).text('Yearly Sales Invoice', { align: 'center' }).moveDown();

        // Date of Report
        doc.fontSize(12).text(`Date of Report: ${new Date().toDateString()}`).moveDown();

        // Invoice Details
        doc.fontSize(16).text('Invoice Details', { underline: true }).moveDown();

        let totalPrice = 0;

        yearlyOrders.forEach(order => {
            doc.fontSize(12).text(`Order Date: ${order.orderDate.toDateString()}`).moveDown();
            doc.fontSize(12).text(`User's Name: ${order.address.name}`).moveDown();
            doc.fontSize(12).text(`Address: ${order.address.CAddress}, ${order.address.street}, ${order.address.city}, ${order.address.pin}`).moveDown();

            doc.fontSize(12).text('Product Details:', { underline: true }).moveDown();
            order.orderItems.forEach(item => {
                doc.fontSize(12).text(`Product Name: ${item.Pname || 'N/A'}`);
                doc.fontSize(12).text(`Category: ${item.Pcategory || 'N/A'}`);
                doc.fontSize(12).text(`Order Status: ${item.orderStatus || 'N/A'}`);
                doc.fontSize(12).text(`Price: ${item.price || 'N/A'}`);
                doc.moveDown();
                totalPrice += Number(item.price) || 0; // Update total price
            });

            doc.moveDown();
        });

        // Total Price
        doc.fontSize(16).text(`Total Price: ${totalPrice}`).moveDown();

        doc.end();
    } catch (error) {
        console.error("Error generating yearly sales invoice:", error);
        res.status(500).redirect('/err500').json({ error: "Internal server error" });
    }
};



exports.addCoupon = async (req, res) => {

    try {
        const code = req.body.code.trim();
        const trimmedCode = code.toUpperCase().trim()
        const discount = req.body.discount;
        const minPrice = req.body.minPrice;
        const expiry = req.body.expiry;

        const checkCode = await couponDb.findOne({ code: trimmedCode });
        console.log("lll", checkCode);
        if (checkCode) {
            req.session.cpnErr = "coupon code already exist"
            console.log('Category already exists:', checkCode);
            return res.status(400).redirect('/admin/addCoupon');
        }

        const newCoupon = await couponDb.create({
            code: trimmedCode,
            discount: discount,
            minPrice: minPrice,
            expiry: expiry,
        });

        const currentDate = Date.now();

        const newData = await couponDb.updateMany({ expiry: { $lte: currentDate } }, { $set: { status: false } })
        console.log(newData);

        console.log('New coupon added:', newCoupon);
        res.status(200).redirect('/admin/couponManagement');
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}

exports.deleteCoupon = async (req, res) => {
    const CId = req.query.CId;
    try {
        const deleting = await couponDb.deleteOne({ _id: CId })
        console.log("coupen deleted successfully", deleting);
        res.status(200).redirect('/admin/couponManagement')
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/err500');
    }
}


exports.getDetailsChart = async (req, res) => {

    try {
        let labelObj = {};
        let salesCount;
        let findQuerry;
        let currentYear;
        let currentMonth;
        let index;


        switch (req.body.filter.toLowerCase()) {
            case "weekly":
                currentYear = new Date().getFullYear();
                currentMonth = new Date().getMonth() + 1;

                labelObj = {
                    Sun: 0,
                    Mon: 1,
                    Tue: 2,
                    Wed: 3,
                    Thu: 4,
                    Fri: 5,
                    Sat: 6,
                };

                salesCount = new Array(7).fill(0);

                findQuerry = {
                    orderDate: {
                        $gte: new Date(currentYear, currentMonth - 1, 1),
                        $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
                    },
                };
                index = 0;
                break;
            case "monthly":
                currentYear = new Date().getFullYear();
                labelObj = {
                    Jan: 0,
                    Feb: 1,
                    Mar: 2,
                    Apr: 3,
                    May: 4,
                    Jun: 5,
                    Jul: 6,
                    Aug: 7,
                    Sep: 8,
                    Oct: 9,
                    Nov: 10,
                    Dec: 11,
                };

                salesCount = new Array(12).fill(0);

                findQuerry = {
                    orderDate: {
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31, 23, 59, 59),
                    },
                };
                index = 1;
                break;
            case "daily":
                currentYear = new Date().getFullYear();
                currentMonth = new Date().getMonth() + 1;
                let end = new Date(currentYear, currentMonth, 0, 23, 59, 59);
                end = String(end).split(" ")[2];
                end = Number(end);

                for (let i = 0; i < end; i++) {
                    labelObj[`${i + 1}`] = i;
                }

                salesCount = new Array(end).fill(0);

                findQuerry = {
                    orderDate: {
                        $gt: new Date(currentYear, currentMonth - 1, 1),
                        $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
                    },
                };

                index = 2;
                break;
            case "yearly":
                findQuerry = {};

                const ord = await Orderdb.find().sort({ orderDate: 1 });
                const stDate = ord[0].orderDate.getFullYear();
                const endDate = ord[ord.length - 1].orderDate.getFullYear();

                for (let i = 0; i <= Number(endDate) - Number(stDate); i++) {
                    labelObj[`${stDate + i}`] = i;
                }

                salesCount = new Array(Object.keys(labelObj).length).fill(0);

                index = 3;
                break;
            default:
                return res.json({
                    label: [],
                    salesCount: [],
                });
        }



        const orders = await Orderdb.aggregate(
            [
                {
                    $match: findQuerry
                },
                {
                    '$unwind': {
                        'path': '$orderItems'
                    }
                }
            ]
        );
        console.log(orders);

        orders.forEach((order) => {
            if (index === 2) {
                salesCount[
                    labelObj[Number(String(order.orderDate).split(" ")[index])]
                ] += 1;
            } else {
                salesCount[labelObj[String(order.orderDate).split(" ")[index]]] += 1;
            }
        });

        res.json({
            label: Object.keys(labelObj),
            salesCount,
        });
    } catch (err) {
       res.status(500).redirect('/err500');
    }
}
