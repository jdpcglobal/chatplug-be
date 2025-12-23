const express = require("express");
const router = express.Router();
const controller = require("../controllers/promptsController");

// Health check
router.get("/health", controller.healthCheck);

// CRUD
router.post("/save", controller.savePromptSet);
router.get("/:websiteId/:promptName", controller.getPromptSet);
router.get("/:websiteId", controller.listPromptSets);
router.put("/:websiteId/:promptName", controller.updatePromptSet);
router.delete("/:websiteId/:promptName", controller.deletePromptSet);

// ✅ Update only promptName
router.put("/:websiteId/updatename/:oldPromptName", controller.updatePromptName);
// Backend API Key operations
router.post("/:websiteId/:promptName/add-backend-key", controller.addBackendApiKey);
router.delete("/:websiteId/:promptName/delete-backend-key", controller.deleteBackendApiKey);
router.get("/backend/:backendApiKey", controller.getByBackendApiKey);

// API Key operations
router.post("/:websiteId/:promptName/add-key", controller.addApiKey);
router.post("/:websiteId/:promptName/remove-key", controller.removeApiKey);
router.put("/:websiteId/:promptName/update-keys", controller.updateApiKeys);
router.get("/:websiteId/:promptName/validate/:apiKey", controller.validateApiKey);

// ✅ promptsWithParams operations (ARRAY VERSION)
router.post("/:websiteId/:promptName/add-prompt", controller.addPromptWithParams);
router.post("/:websiteId/:promptName/remove-prompt", controller.removePromptWithParams);
router.get("/:websiteId/:promptName/get-prompt/:promptname", controller.getPromptWithParams);
router.put("/:websiteId/:promptName/update-prompt", controller.updatePromptWithParams);

module.exports = router;