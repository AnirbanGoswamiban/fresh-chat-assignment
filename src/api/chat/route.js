const express=require('express')
const router=express.Router()
const chats=require('./controller')
const {authenticate} = require('../../middleware/auth')

router.post('/savemessage',authenticate,chats.saveMessages)
router.get('/getMessages',authenticate,chats.getMessagesForUser)
router.get('/getBothSideMessage',authenticate,chats.getMessagesBetweenUsers)
router.get('/getFromRedis',authenticate,chats.getAllMessagesForUser)

module.exports=router