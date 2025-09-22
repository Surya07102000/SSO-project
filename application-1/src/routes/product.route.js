const { Router } = require('express')
const productController = require('../controllers/product.controller')
const { validateRequest } = require('../middlewares/requestValidator');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = Router()

router.post('/',  validateRequest, productController.create)
router.get('/', authMiddleware, productController.list)
router.get('/:id', authMiddleware, productController.getById)
router.patch('/:id', authMiddleware, validateRequest, productController.update)
router.delete('/:id', authMiddleware, productController.remove)

module.exports = router