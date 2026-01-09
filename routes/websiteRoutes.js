// routes/websiteRoutes.js
const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');

router.get('/client-config', websiteController.getClientWebsiteConfig);
// 🔑 API-key based (ALWAYS FIRST)
router.get('/header', websiteController.getWebsitesHeader);
router.get('/chat-config', websiteController.getChatConfig);

// CRUD
router.post('/', websiteController.createWebsite);
router.get('/', websiteController.getWebsites);
router.get('/:id', websiteController.getWebsiteById);

// Updates
router.put('/:id', websiteController.updateWebsite);
router.patch('/:id/custom-data', websiteController.updateWebsiteCustomData);
router.patch('/:id/status', websiteController.updateWebsiteStatus);

// Delete
router.delete('/:id', websiteController.deleteWebsite);

// Sync
router.post('/sync', websiteController.syncWebsites);

module.exports = router;
