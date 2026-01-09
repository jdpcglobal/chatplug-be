// controllers/websiteController.js
const websiteModel = require('../models/websiteModel');

// CREATE
exports.createWebsite = async (req, res) => {
  const result = await websiteModel.saveWebsite(req.body);
  res.status(result.success ? 201 : 400).json(result);
};

// READ ALL
exports.getWebsites = async (req, res) => {
  // Check if API key is provided for single website lookup
  const apiKey = req.query.apiKey || req.headers['x-api-key'];
  
  if (apiKey) {
    // If API key provided, return specific website
    const result = await websiteModel.getWebsiteByApiKey(apiKey);
    res.status(result.success ? 200 : 404).json(result);
  } else {
    // Otherwise return all websites
    const result = await websiteModel.getAllWebsites();
    res.status(result.success ? 200 : 400).json(result);
  }
};

// READ ONE BY ID
exports.getWebsiteById = async (req, res) => {
  const { id } = req.params;
  const result = await websiteModel.getWebsiteById(id);
  res.status(result.success ? 200 : 404).json(result);
};

// READ ONE BY API KEY
exports.getWebsiteByApiKey = async (req, res) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing apiKey' 
    });
  }

  const result = await websiteModel.getWebsiteByApiKey(apiKey);
  res.status(result.success ? 200 : 404).json(result);
};

// UPDATE FULL WEBSITE BY ID
exports.updateWebsite = async (req, res) => {
  const { id } = req.params;
  const result = await websiteModel.updateWebsite(id, req.body);
  res.status(result.success ? 200 : 400).json(result);
};

// UPDATE CUSTOM DATA ONLY BY ID
exports.updateWebsiteCustomData = async (req, res) => {
  const { id } = req.params;
  const result = await websiteModel.updateWebsiteCustomData(id, req.body);
  res.status(result.success ? 200 : 400).json(result);
};

// UPDATE STATUS ONLY BY ID
exports.updateWebsiteStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const result = await websiteModel.updateWebsiteStatus(id, status);
  res.status(result.success ? 200 : 500).json(
    result.success ? result : { error: result.error }
  );
};

// DELETE BY ID
exports.deleteWebsite = async (req, res) => {
  const { id } = req.params;
  const result = await websiteModel.deleteWebsite(id);
  res.status(result.success ? 200 : 400).json(result);
};

// SYNC FROM EXTERNAL API
exports.syncWebsites = async (req, res) => {
  const { apiBaseUrl, backendApiKey } = req.body;
  
  if (!apiBaseUrl || !backendApiKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing apiBaseUrl or backendApiKey'
    });
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/websites`, {
      headers: { Authorization: `Bearer ${backendApiKey}` },
    });

    if (!response.ok) throw new Error('Failed to fetch websites');

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No websites found'
      });
    }

    const savedItems = [];
    for (const item of data.items) {
      const result = await websiteModel.saveWebsite(item);
      if (result.success) savedItems.push(result.item);
    }

    const allWebsites = await websiteModel.getAllWebsites();
    
    res.json({
      success: true,
      message: `Fetched and synced ${savedItems.length} websites`,
      items: allWebsites.items
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
exports.getWebsitesHeader = async (req, res) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing apiKey'
    });
  }

  const result = await websiteModel.getWebsiteByApiKey(apiKey);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json({
    success: true,
    item: {
      websiteName: result.item.websiteName,
      status: result.item.status
    }
  });
};
exports.getChatConfig = async (req, res) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing apiKey'
    });
  }

  const result = await websiteModel.getWebsiteByApiKey(apiKey);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.status(200).json({
    success: true,
    item: {
      systemPrompt: result.item.systemPrompt,
      customPrompt: result.item.customPrompt,
      category: result.item.category,
      urls: result.item.urls,
      library: result.item.library
    }
  });
};
exports.getWelcomeMessages = async (req, res) => {
  const { websiteId } = req.query;

  if (!websiteId) {
    return res.status(400).json({
      success: false,
      error: 'Missing websiteId'
    });
  }

  const result = await welcomeMessageModel.getByWebsiteId(websiteId);

  if (!result.success) {
    return res.status(404).json(result);
  }

  return res.json({
    success: true,
    items: result.items.map(item => ({
      message: item.message
    }))
  });
};
// controllers/website.controller.js

exports.getClientWebsiteConfig = async (req, res) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing apiKey'
    });
  }

  try {
    const result = await websiteModel.getWebsiteByApiKey(apiKey);

    if (!result.success || !result.item) {
      return res.status(404).json({
        success: false,
        error: 'Website not found'
      });
    }

    const website = result.item;

    // ✅ ONLY REQUIRED FIELDS
    return res.status(200).json({
      success: true,
      item: {
        id: website.id,
        websiteName: website.websiteName,
        status: website.status,
        systemPrompt: website.systemPrompt || [],
        customPrompt: website.customPrompt || [],
        category: website.category || []
      }
    });
  } catch (error) {
    console.error('Client config error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
