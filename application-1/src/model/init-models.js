const { DataTypes } = require('sequelize');
const productSchema = require('./schema/product.js');
const { sequelize } = require('../config/db_conn');

const products = productSchema(sequelize)


module.exports = {
  products,
  sequelize
}; 