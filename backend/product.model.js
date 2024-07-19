const { admin, db } = require('./firebase/firebase');

const Product = {
  name: String,
  price: Number,
  description: String,
  amount: Number,
  type: String,
  colour: String,
  material: String,
  brand: String,
  image: String,
  size: Number,
  totalOrdered: Number,
  stockStatus: String
};

module.exports = Product;
