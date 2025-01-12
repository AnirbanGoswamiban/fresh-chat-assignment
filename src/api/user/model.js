const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roleType:{
    type:String,
    required:true
  },
  isLoggedIn:{
    type:Boolean,
    required:true
  }
});

module.exports = mongoose.model("USER2", userSchema);