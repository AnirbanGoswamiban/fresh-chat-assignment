const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    ref:"USER2"
  },
  receiver: {
    type: String,
    required: true,
    ref:"USER2"
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, 
    required:true
  },
});

module.exports = mongoose.model("CHAT", chatSchema);