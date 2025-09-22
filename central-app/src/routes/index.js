const express = require('express');
const router = express.Router();
const authRoute = require('./auth.route')
const applicationRoute = require('./application.route')

router.use('/auth', authRoute);
router.use('/application', applicationRoute)

module.exports = router