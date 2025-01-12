const express = require("express");
const router = express.Router();
const connectionController = require("./controller");
const { authenticate } = require("../../middleware/auth");

// Create a connection
router.post("/create", authenticate, connectionController.createConnection);

// Get connections for a user
router.get("/list", authenticate, connectionController.getConnectionsForUser);

module.exports = router;
