const Connection = require("./model");

// Create a new connection
exports.createConnection = async (req, res) => {
  try {
    const { userId, connectionId } = req.body;

    if (!userId || !connectionId) {
      return res.status(400).json({ type: "failed", message: "Both userId and connectionId are required." });
    }

    // Prevent duplicate connections
    const existingConnection = await Connection.findOne({
      $or: [
        { userId, connectionId },
        { userId: connectionId, connectionId: userId },
      ],
    });

    if (existingConnection) {
      return res.status(200).json({ type: "failed", message: "Connection already exists." });
    }

    const newConnection = new Connection({ userId, connectionId });
    await newConnection.save();

    return res.status(200).json({
      type: "success",
      message: "Connection created successfully.",
      data: newConnection,
    });
  } catch (error) {
    console.error("Error creating connection:", error);
    return res.status(500).json({
      type: "failed",
      message: "Failed to create connection. Please try again later.",
    });
  }
};

// Retrieve connections for a user
exports.getConnectionsForUser = async (req, res) => {
  try {
    const connections = await Connection.find()
      .populate('userId', 'name email')  
      .select('-connectionId'); 

    return res.status(200).json({
      type: "success",
      message: "Connections retrieved successfully.",
      data: connections,
    });
  } catch (error) {
    console.error("Error retrieving connections:", error);
    return res.status(500).json({
      type: "failed",
      message: "Failed to retrieve connections. Please try again later.",
    });
  }
};

