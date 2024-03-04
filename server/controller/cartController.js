const mongoose = require('mongoose')
const cartdb = require('../model/cartSchema')
const productdb = require('../model/productSchema')

exports.postCart = async (req, res) => {
  console.log("its in cart post");
  const productId = req.query.productId;
  const userId = req.session.email;
  
  if (typeof userId === "undefined") {
      return res.redirect('/login'); // Use return to exit the function after redirection
  }

  try {
      const data = await cartdb.findOne({ userId: userId, 'products.productId': productId });
      console.log(data);

      if (data) {
          return res.redirect('/cart'); // Remove the "return res.status(200).redirect('/cart');" line
      }

      const createdData = await cartdb.updateOne(
          { userId: userId },
          { $push: { "products": { "productId": productId } } },
          { upsert: true }
      );

      console.log(createdData);
      return res.redirect('/cart'); // Return the redirection here
  } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Failed to show cart" });
  }
}


exports.deleteCart = async (req, res) => {
    try {
      const deleted = await cartdb.updateOne(
        { userId: req.session.email },
        { $pull: { products: { _id: req.query.productId } } }
      );
    console.log(req.query.productId)
   

     
  
      console.log('hai')
      console.log(deleted);
  
      res.status(200).redirect('/cart');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };
  
  exports.updateQuantity = async (req, res) => {
    console.log("updating quantity");
    try {
        const productId = req.query.productId;
        console.log(productId);
        const quantityUpdate = req.query.quantityUpdate;
        console.log(quantityUpdate);

        const updatingdb = await cartdb.updateOne(
            { userId: req.session.email, "products.productId": productId },
            { $set: { "products.$.quantity": quantityUpdate } },
            { new: true }
        );
        console.log(updatingdb);

        res.status(200).send({ message: 'Quantity updated successfully' });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).send({ message: 'Error updating quantity' });
    }
};
