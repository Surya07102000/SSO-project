const productService = require('../services/product.service');
const { success, error } = require('../utils/responseBuilder');

const create = async (req, res) => {
  try {
    const result = await productService.createProduct(req.body);
    return success.created(res, 'Product created successfully', result.data);
  } catch (err) {
    if (err.statusCode === 400) return error.badRequest(res, err.message);
    if (err.statusCode === 409) return error.conflict(res, err.message);
    return error.internal(res, 'Create product failed', err);
  }
};

const list = async (req, res) => {
  try {
    const result = await productService.listProducts();
    return success.ok(res, 'Products fetched successfully', result.data);
  } catch (err) {
    return error.internal(res, 'Fetch products failed', err);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductById(id);
    return success.ok(res, 'Product fetched successfully', result.data);
  } catch (err) {
    if (err.statusCode === 404) return error.notFound(res, err.message);
    return error.internal(res, 'Fetch product failed', err);
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.updateProduct(id, req.body);
    return success.ok(res, 'Product updated successfully', result.data);
  } catch (err) {
    if (err.statusCode === 404) return error.notFound(res, err.message);
    if (err.statusCode === 409) return error.conflict(res, err.message);
    return error.internal(res, 'Update product failed', err);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    return success.ok(res, 'Product deleted successfully');
  } catch (err) {
    if (err.statusCode === 404) return error.notFound(res, err.message);
    return error.internal(res, 'Delete product failed', err);
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  remove
};


