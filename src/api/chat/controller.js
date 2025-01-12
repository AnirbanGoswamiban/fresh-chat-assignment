const Chat = require("../chat/model");  
const {client} = require("../../../db/redis")

// Save bulk messages
exports.saveMessages = async (req, res) => {
  try {
    const messages = req.body.messages; 


    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({type:"failed", message: "Messages array is required and cannot be empty." });
    }


    for (let i = 0; i < messages.length; i++) {
      const { sender, receiver, message } = messages[i];

      if (!sender || !receiver || !message) {
        return res.status(400).json({type:"failed", message: `Message at index ${i} is invalid. Sender, receiver, and message are required.` });
      }
    }

    // Save the bulk messages to the database
    const savedMessages = await Chat.insertMany(messages);

    return res.status(200).json({
      type:'success',
      message: "Messages saved successfully",
      data: savedMessages,
    });
  } catch (error) {
    console.error("Error saving bulk messages:", error);
    return res.status(500).json({
      error: "Failed to save messages. Please try again later.",
    });
  }
};

// Retrieve paginated messages between two users
exports.getMessagesBetweenUsers = async (req, res) => {
  try {
    const {user1, user2, page = 1, limit = 50 } = req.query; 

    // Validate input
    if (!user1 || !user2) {
      return res.status(400).json({ type:"failed",mesage: "Both user IDs are required." });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    
    const messages = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
      .sort({ timestamp: -1 })  
      .skip(skip)  
      .limit(parseInt(limit));  
    // Get the total count of messages for the conversation
    const totalMessages = await Chat.countDocuments({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    });

    return res.status(200).json({
      type:"success",
      message: "Messages retrieved successfully",
      data: messages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return res.status(500).json({
      type:"failed",
      message: "Failed to retrieve messages. Please try again later.",
    });
  }
};

// Retrieve paginated messages for a specific user
exports.getMessagesForUser = async (req, res) => {
  try {
    const { userId, page = 1, limit = 50 } = req.query; // Defaults: page = 1, limit = 50

    // Validate input
    if (!userId) {
      return res.status(400).json({type:"failed", message: "User ID is required." });
    }

   
    const skip = (page - 1) * limit;

    // Fetch messages with pagination
    const messages = await Chat.find({
      $or: [{ sender: userId }, { reciver: userId }],
    })
      .sort({ timestamp: -1 }) 
      .skip(skip)  
      .limit(parseInt(limit)); 
      
    // Get the total count of messages for the user
    const totalMessages = await Chat.countDocuments({
      $or: [{ sender: userId }, { reciver: userId }],
    });

    return res.status(200).json({
      type:'success',
      message: "Messages retrieved successfully",
      data: messages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return res.status(500).json({
      type:'failed',
      message: "Failed to retrieve messages. Please try again later.",
    });
  }
};

//Retrive from redis
exports.getAllMessagesForUser = async (req, res) => {
  try {
    const { userId } = req.query;

    // Validate input
    if (!userId) {
      return res.status(400).json({ type: "failed", message: "User ID is required." });
    }

    // Fetch all messages for the user from Redis
    let messages = await client.get(`user:${userId}`); 

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        type: "failed",
        message: "No messages found for the user.",
      });
    }

    // Parse messages since Redis stores them as strings
    const parsedMessages = JSON.parse(messages);

    return res.status(200).json({
      type: "success",
      message: "All messages retrieved successfully",
      data: parsedMessages,
      totalMessages: parsedMessages.length,
    });
  } catch (error) {
    console.error("Error retrieving messages from Redis:", error);
    return res.status(500).json({
      type: "failed",
      message: "Failed to retrieve messages. Please try again later.",
    });
  }
};

