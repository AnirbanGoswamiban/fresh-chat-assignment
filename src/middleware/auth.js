const secret = process.env.SECRET;
const User = require('../api/user/model');
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(400).json({ type: "failed", message: "Please log in" });
    }

    // Verify the token
    const payload = jwt.verify(token, secret);
    const { _id } = payload;

    // Find the user by ID
    const userdata = await User.findById(_id);
    if (!userdata) {
      throw new Error("User not found");
    }

    // Attach user data to the request object
    req.user = userdata;
    next();
  } catch (err) {
    return res.status(500).json({ type: "failed", message: "Authentication failed: " + err.message });
  }
};
