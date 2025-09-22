const { Router } = require('express')
const applicationController = require('../controllers/application.controller')
const { validateRequest } = require('../middlewares/requestValidator');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = Router()

router.post('/', authMiddleware, validateRequest, applicationController.create )
router.patch('/:id', authMiddleware, validateRequest, applicationController.update )
router.get('/read', authMiddleware, applicationController.getApplication )

module.exports = router