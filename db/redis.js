
const redis=require('redis')
const client =redis.createClient({
    url: `${process.env.REDIS_KEY}`
  });

async function redisConnect(){
    try{
        await client.connect()
        console.log("redis is connected")
    }catch(err){
        console.log("error")
    }
}
module.exports = {client,redisConnect}