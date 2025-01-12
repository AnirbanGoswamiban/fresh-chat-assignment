const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "USER2", 
  },
  connectionId: {
    type: String,
    required: true,
    ref: "USER2", 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CONNECTION", connectionSchema);
