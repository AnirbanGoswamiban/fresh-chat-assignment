const User = require("./model");
const bcrypt = require("bcrypt");
const secret = process.env.SECRET
const jwt = require("jsonwebtoken");

exports.sign_up = async (req, res) => {
  try {
    const { name, email, password, roleType } = req.body;

    // Check for required fields
    if (!name || !roleType || !email || !password) {
      throw {status:422,message:"incomplete feilds"}
    }

    // Hash the password
    const encrypt_password = await bcrypt.hash(password, 10);

    // Check if the user already exists
    const check_unique_user = await User.findOne({
      email: email,
    });

    if (check_unique_user) {
        throw {status:400,message:"user already exists"}
    }

    // Create a new user
    const user = new User({
      name,
      roleType,
      email,
      password: encrypt_password,
      isLoggedIn:false
    });

    // Save the user to the database
    const saved_status = await user.save();

    if (saved_status) {
      return res.status(200).json({type:"success", message: "Registered successfully" });
    }
  } catch (err) {
    return res.status(err.status).json({ type:"failed","message": err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for required fields
    if (!email  || !password) {
        throw {status:422,message:"incomplete feilds"}
    }

    
    // const check = await User.findOne({ email: email,isLoggedIn:false});
    const check = await User.findOne({ email: email});

    if (check) {
      // Verify the password
      const checkpass = await bcrypt.compare(password, check.password);
      if (checkpass) {
        // Generate a token
        const token = jwt.sign({ _id: check.id }, secret);

        //set login true
        check.isLoggedIn = true;
        await check.save();

        return res.status(200).json({
          type:"success",
          message: "logged in successfully",
          token: token,
          id: check._id,
          name: check.name,
          email: check.email,
          roleType: check.roleType,
          isLoggedIn:check.isLoggedIn
        });
      } else {
        return res.status(400).json({type:"failed", message: "invalid password" });
      }
    } else {
      return res.status(400).json({type:"failed", message: "user doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({type:"failed", message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { email } = req.body;

    // Check for required field
    if (!email) {
      throw { status: 422, message: "Email is required to log out" };
    }

    // Find the user by email
    const user = await User.findOne({ email: email,isLoggedIn:true});

    if (user) {
      // Set isLoggedIn to false
      user.isLoggedIn = false;
      await user.save();

      return res.status(200).json({
        type: "success",
        message: "Logged out successfully",
      });
    } else {
      return res.status(400).json({ type: "failed", message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ type: "failed", message: err.message });
  }
};

exports.checkUserStatus = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if the userId is provided
    if (!userId) {
      throw { status: 422, message: "userId is required" };
    }

    // Find the user by userId
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ type: "failed", message: "User not found" });
    }

    // Check if the user is logged in
    if (user.isLoggedIn) {
      return res.status(200).json({
        type: "success",
        message: "User is logged in",
        roleType: user.roleType,
      });
    } else {
      return res.status(422).json({
        type: "failed",
        message: "User is not logged in",
      });
    }
  } catch (err) {
    return res.status(err.status || 500).json({
      type: "failed",
      message: err.message || "An error occurred",
    });
  }
};

