const mongodb = require("mongoose");

const wishlistchema = new mongodb.Schema({
  userId: {
    type: String,
    required: true,
  },
  products: [
    {
        type: mongodb.Types.ObjectId,
        required: true,
    }
  ],
});

const wishlistdb = mongodb.model('wishlist', wishlistchema);

module.exports = wishlistdb;