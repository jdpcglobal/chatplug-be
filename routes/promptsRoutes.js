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

module.exports = router;
