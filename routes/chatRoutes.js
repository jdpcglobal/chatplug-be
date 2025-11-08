// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Test connection
router.get('/chat-requests/test', chatController.testConnection);

// Create new chat request
router.post('/chat-requests', chatController.createChatRequest);

// Get all chat requests (main endpoint for admin)
router.get('/chat-requests', chatController.getAllChatRequests);

// ✅ NEW: Get chat requests by backend API Key
router.get('/chat-requests/backend-api-key/:backendApiKey', chatController.getChatRequestsByBackendApiKey);

// Get chat requests by website ID
router.get('/chat-requests/website/:websiteId', chatController.getChatRequestsByWebsite);

// Get chat request by ID
router.get('/chat-requests/:id', chatController.getChatRequestById);

// Update chat request status
router.put('/chat-requests/:id/status', chatController.updateChatRequestStatus);

// Delete chat request
router.delete('/chat-requests/:id', chatController.deleteChatRequest);

// Get chat statistics
router.get('/chat-stats', chatController.getChatStats);

module.exports = router;