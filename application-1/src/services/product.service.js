const { products } = require('../model/init-models');

const createProduct = async (payload) => {
  try {
    const { title, description, price, quantity, is_active } = payload;

    if (!title || price === undefined || quantity === undefined) {
      const err = new Error('title, price and quantity are required');
      err.statusCode = 400;
      throw err;
    }

    const existing = await products.findOne({ where: { title } });
    if (existing) {
      const err = new Error('Product title already exists');
      err.statusCode = 409;
      throw err;
    }

    const product = await products.create({
      title,
      description: description || null,
      price,
      quantity,
      is_active: is_active !== undefined ? is_active : true
    });

    return { success: true, data: product };
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'SequelizeDatabaseError') {
      const err = new Error(`Database error during product creation: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
};

const listProducts = async () => {
  try {
    const list = await products.findAll();
    return { success: true, data: list };
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError') {
      const err = new Error(`Database error while fetching products: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
};

const getProductById = async (id) => {
  try {
    const product = await products.findByPk(id);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, data: product };
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'SequelizeDatabaseError') {
      const err = new Error(`Database error while fetching product: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
};

const updateProduct = async (id, payload) => {
  try {
    const product = await products.findByPk(id);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const { title, description, price, quantity, is_active } = payload;

    if (title && title !== product.title) {
      const existing = await products.findOne({ where: { title } });
      if (existing) {
        const err = new Error('Product title already exists');
        err.statusCode = 409;
        throw err;
      }
      product.title = title;
    }
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (is_active !== undefined) product.is_active = is_active;

    await product.save();
    return { success: true, data: product };
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'SequelizeDatabaseError') {
      const err = new Error(`Database error during product update: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await products.findByPk(id);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    await product.destroy();
    return { success: true };
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'SequelizeDatabaseError') {
      const err = new Error(`Database error during product deletion: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct
};


