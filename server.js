require('dotenv').config()
const express=require('express')
const bodyparser=require('body-parser')
const { Server } = require("socket.io");
const http = require('http');
const cors=require('cors')
const app=express()
const {connection} = require('./db/db')
const {redisConnect,client} = require('./db/redis')
const allRoutes = require('./src/api/index')
const setupSocket = require('./Socket/socket')
// const socketIo = require('socket.io');

app.use(bodyparser.urlencoded({extended:false}))
app.use(express.json())
app.use(cors())
app.use(express.static('public'))

//socket
const server = http.createServer(app);  
const io = new Server(server, {
  cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
  },
});

//routes
app.use('/api',allRoutes)

const port=process.env.PORT

// app.listen(port,()=>{
//     console.log(`app running at port ${port}`);
// })
server.listen(port,()=>{
  console.log(`app running at port ${port}`);
})
connection()
redisConnect()
setupSocket(io)