const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');

router.post('/', websiteController.createWebsite);
router.get('/', websiteController.getWebsites);
router.get('/:id', websiteController.getWebsite);
router.put('/:id', websiteController.updateWebsite);
router.delete('/:id', websiteController.deleteWebsite);
router.patch('/:id/status', websiteController.updateWebsiteStatus);
router.post('/sync', websiteController.syncWebsites);

module.exports = router;
