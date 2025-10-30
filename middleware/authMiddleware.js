const websiteModel = require('../models/websiteModel');

const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ success: false, error: 'API key required' });
    }

    const result = await websiteModel.getAllWebsites();
    if (!result.success) return res.status(500).json(result);

    const website = result.items.find((w) => w.apiKey === apiKey);

    if (!website) {
      return res.status(403).json({ success: false, error: 'Invalid API key' });
    }

    req.website = website;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { validateApiKey };
