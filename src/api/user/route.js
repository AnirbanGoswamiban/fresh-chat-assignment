const express=require('express')
const router=express.Router()
const users=require('./controller')
const {authenticate} = require('../../middleware/auth')

router.post('/signup',users.sign_up)
router.post('/login',users.login)
router.post('/logout',users.logout)
router.post('/check',authenticate,users.checkUserStatus)

module.exports=router