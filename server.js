// server.js

// ---------------------------
//  Import Dependencies
// ---------------------------
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// ---------------------------
//  Import Routes
// ---------------------------
const childPromptRoutes = require("./routes/promptsRoutes");
const websiteRoutes = require("./routes/websiteRoutes");

// ---------------------------
//  Initialize App
// ---------------------------
const app = express();

// ---------------------------
//  Middleware
// ---------------------------
app.use(cors());
app.use(bodyParser.json());

// ---------------------------
//  Serve Static Files
// ---------------------------
// If you have a frontend build folder (like React or HTML files),
// place them in the "public" directory.
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------
//  Root Route
// ---------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------------------------
//  API Routes
// ---------------------------
app.use("/api/childprompt", childPromptRoutes);
app.use("/api/websites", websiteRoutes);

// ---------------------------
//  Error Handling Middleware
// ---------------------------
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// ---------------------------
//  Start the Server
// ---------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}/api`);
});
