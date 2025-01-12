const express = require('express')
const router = express.Router()
const userRoutes = require('./user/route')
const chatRoutes = require('./chat/route')
const connectionRoutes = require('./Connection/route')
router.use('/auth',userRoutes)
router.use('/chat',chatRoutes)
router.use('/connection',connectionRoutes)
module.exports = router