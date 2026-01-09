const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer(); // memory storage
const { executeUrls } = require("../controllers/executeUrls.controller");

router.post(
  "/execute-urls",
  upload.none(), // 👈 IMPORTANT (FormData parser)
  executeUrls
);

module.exports = router;
