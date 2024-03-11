const Orderdb = require('../model/orderSchema')
const productdb = require('../model/productSchema')
const cartdb = require('../model/cartSchema');
const { default: mongoose } = require('mongoose');
const walletdb = require('../model/walletSchema');
const PDFDocument = require("pdfkit-table")


exports.adminChangeOrderStatus = async (req, res) => {
  console.log("changing order status");
  const orderId = req.query.orderId;
  const productId = req.query.productId;
  const orderStatus = req.body.orderStatus;

  try {
    if (orderStatus === "Cancelled") {
      const units = await Orderdb.findOne({
        $and: [{ _id: orderId },
        { 'orderItems.productId': productId }]
      },
        { 'orderItems.$': 1, _id: 0 })

      await productdb.updateOne(
        { productId: productId },
        { $inc: { units: units.orderItems[0].units } })
    }
    await Orderdb.updateOne(
      {
        $and: [
          { _id: orderId },
          { "orderItems.productId": productId }
        ]
      },
      { $set: { "orderItems.$.orderStatus": orderStatus } })
    res.status(200).redirect('/admin/orderManagement')
  } catch (error) {
    console.log(error);
    res.status(500).redirect('/err500');
  }
}


exports.cancelOrder = async (req, res) => {
  const productId = req.query.productId;
  const orderId = req.query.orderId;
  try {
    const checking = await Orderdb.findById(orderId)
    if (checking.paymentMethod === "cod") {
      const order = await Orderdb.findOneAndUpdate({
        $and: [{ _id: orderId }, { 'orderItems.productId': productId }]
      },
        {
          $set: {
            "orderItems.$.orderStatus": "Cancelled"
          }
        }
      )
      const units = order.orderItems.find(value => {
        if (String(value.productId) === productId) {
          return value.units;
        }
      })
      await productdb.updateOne({ _id: productId },
        {
          $inc: {
            units: units.units
          }
        });
      console.log("order cancelled");
      req.session.isCancelled = true;
      return res.status(200).json({success:true , message: "Order cancelled successfully" });

    } else if (checking.paymentMethod === "onlinePayment" || checking.paymentMethod === "wallet") {
      const order = await Orderdb.findOneAndUpdate({
        $and: [{ _id: orderId }, { 'orderItems.productId': productId }]
      },
        {
          $set: {
            "orderItems.$.orderStatus": "Cancelled"
          }
        }
      )

      const units = order.orderItems.find(value => {
        if (String(value.productId) === productId) {
          return value.units;
        }
      })

      let cancelPrice = units.price * units.units
      if (units.priceAfterCoupon > 0) {
        cancelPrice = units.priceAfterCoupon
      }

      await walletdb.updateOne({ userId: req.session.email }, {
        $inc: {
          balance: cancelPrice
        },
        $push: {
          transactions: {
            amount: cancelPrice
          }
        }
      }, { upsert: true });
      await productdb.updateOne({ _id: productId },
        {
          $inc: {
            units: units.units
          }
        });
      console.log("order cancelled");
      req.session.isCancelled = true;
      return res.status(200).json({success:true , message: "Order cancelled successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).redirect('/err500');
  }
}




function generateInvoiceNumber() {
  // Generate a random number or use a unique ID library
  return Math.floor(Math.random() * 1000000) + 1; // Just a simple example, not guaranteed to be unique
}

exports.invoice = async (req, res) => {
  const orderId = req.query.orderId;
  try {
      const order = await Orderdb.findOne({ _id: orderId });

      const doc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');

      doc.pipe(res);

      // Generate and assign invoice number
      const invoiceNumber = generateInvoiceNumber();

      // Title
      doc.fontSize(24).text('Invoice', { align: 'center' }).moveDown();

      // Order Information
      doc.fontSize(16).text(`Invoice Number: ${invoiceNumber}`).moveDown();
      doc.fontSize(12).text(`Order Date: ${order.orderDate.toDateString()}`).moveDown();

      // Client Information
      doc.fontSize(16).text('Client Information', { underline: true }).moveDown();
      doc.fontSize(12).text(`Name: ${order.address.name}`).moveDown();
      doc.fontSize(12).text(`Address: ${order.address.CAddress}, ${order.address.street}, ${order.address.city}, ${order.address.pin}`).moveDown();

      // Product Details Table
      doc.fontSize(16).text('Product Details', { underline: true }).moveDown();
      const tableHeaders = ['Product Name', 'Quantity', 'Unit Price', 'Total Price'];
      const tableData = order.orderItems.map(item => [
          item.Pname,
          item.units,
          item.price,
          item.price * item.units
      ]);
      doc.table({
          headers: tableHeaders,
          rows: tableData,
          align: ['left', 'right', 'right', 'right'],
          widths: [200, 75, 75, 75],
          layout: 'lightHorizontalLines'
      });
      doc.moveDown();

      // Total Price
      doc.fontSize(16).text(`Total Price after all discounts : ${order.totalPrice}`).moveDown();

      doc.end();
  } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).redirect('/err500');
  }
};




exports.returnOrder = async (req, res) => {
  const productId = req.query.productId;
  const orderId = req.query.orderId;
  try {
      const order = await Orderdb.findOneAndUpdate({
          $and: [{ _id: orderId }, { 'orderItems.productId': productId }]
      },
          {
              $set: {
                  "orderItems.$.orderStatus": "Returned"
              }
          }
      )
      const units = order.orderItems.find(value => {
          if (String(value.productId) === productId) {
              return value.units;
          }
      })

      let cancelPrice = units.price * units.units
      if (units.priceAfterCoupon > 0) {
          cancelPrice = units.priceAfterCoupon
      }

      await walletdb.updateOne({ userId: req.session.email }, {
          $inc: {
              balance: cancelPrice
          },
          $push: {
              transactions: {
                  amount: cancelPrice
              }
          }
      }, { upsert: true });
      await productdb.updateOne({ _id: productId },
          {
              $inc: {
                  units: units.units
              }
          });
      console.log("order returned");
      req.session.isCancelled = true;
      return res.status(200).json({ success: true,url:'/getOrders', message: "Order returned successfully" });
  } catch (error) {
      console.log(error);
      res.status(500).redirect('/err500');
  }
}

