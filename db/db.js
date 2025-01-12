const mongoose = require('mongoose')
const mongodb_url = process.env.MONGO_URL

async function connection() {
  try {
    const connection_status = await mongoose.connect(mongodb_url);
    if (connection_status) {
      console.log("database connected");
    }
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = {
  connection,
};