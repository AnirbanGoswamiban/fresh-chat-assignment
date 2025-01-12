const { client } = require('../db/redis');

const GLOBAL_ROOM = "global_room";
let companySocketId = null;

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.emit("joined", { message: "Welcome! You have successfully joined." });

    socket.join(GLOBAL_ROOM);

    socket.on("companyLogin", () => {
      companySocketId = socket.id;
      console.log("Company logged in with socket ID:", companySocketId);
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }, callback) => {
      if (!senderId || !receiverId || !message) {
        console.error("Invalid sendMessage payload");
        return callback && callback({ status: "error", message: "Invalid payload" });
      }
    
      const timestamp = new Date().toISOString();
      const messageObj = {
        type: "outgoing",
        message,
        sender: senderId,
        receiver: receiverId,
        timestamp,
      };
    
      const receiverMessageObj = { ...messageObj, type: "incoming" };
    
      try {
        // Fetch previous messages for the sender
        let senderMessages = await client.get(`user:${senderId}`);
        senderMessages = senderMessages ? JSON.parse(senderMessages) : []; // Parse or initialize as empty array
        senderMessages.push(messageObj); // Add the new message
        await client.set(`user:${senderId}`, JSON.stringify(senderMessages)); // Save back to Redis
    
        // Fetch previous messages for the receiver
        let receiverMessages = await client.get(`user:${receiverId}`);
        receiverMessages = receiverMessages ? JSON.parse(receiverMessages) : []; // Parse or initialize as empty array
        receiverMessages.push(receiverMessageObj); // Add the new message
        await client.set(`user:${receiverId}`, JSON.stringify(receiverMessages)); // Save back to Redis
    
        // Emit the message to all clients in the GLOBAL_ROOM
        io.to(GLOBAL_ROOM).emit("receiveMessage", messageObj);
    
        callback && callback({ status: "success", message: "Message delivered" });
      } catch (err) {
        console.error("Error saving message to Redis:", err);
        callback && callback({ status: "error", message: "Failed to deliver message" });
      }
    });
    

    socket.on("typing", ({ senderId, receiverId }) => {
      if (!senderId || !receiverId) {
        console.error("Invalid typing payload");
        return;
      }
      socket.to(receiverId).emit("typing", { senderId });
    });
    socket.on("online", ({ senderId, receiverId }) => {
      console.log("incomming onlin status")
      if (!senderId || !receiverId) {
        console.error("Invalid online payload");
        return;
      }
      socket.to(receiverId).emit("online", { senderId });
    });
    // Backend socket event handling
    socket.on("userStatus", ({ senderId, status }) => {
  if (!senderId || !status) {
    console.error("Invalid userStatus payload");
    return;
  }
  // Emit to specific user or all connected users
  socket.broadcast.emit("userStatus", { userId: senderId, status });
          });




    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (socket.id === companySocketId) {
        console.log("Company has disconnected.");
        companySocketId = null;
      }
    });
  });

  console.log("Socket is live");
};

module.exports = setupSocket;
