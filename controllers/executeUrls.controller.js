const fetch = require("node-fetch");
const model = require("../models/promptsModel");

exports.executeUrls = async (req, res) => {
  try {
    const body = req.body || {};
    const { websiteId, promptName } = body;

    if (!websiteId) {
      return res.status(400).json({ error: "websiteId is required" });
    }
    if (!promptName) {
      return res.status(400).json({ error: "promptName is required" });
    }

    // 🔎 Fetch config
    const promptSet = await model.getPromptSet(websiteId, promptName);
    if (!promptSet) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    const urlsToCall = promptSet.urls || [];
    const apiKeys = promptSet.apiKeys || [];

    // 🔹 fallback: use DB requiredParams if configured, else use all keys from payload
    const requiredParams = Array.isArray(promptSet.requiredParams) && promptSet.requiredParams.length > 0
      ? promptSet.requiredParams
      : Object.keys(body);

    const results = [];

    for (let i = 0; i < urlsToCall.length; i++) {
      const url = urlsToCall[i];
      if (!url || url.trim() === "") continue;

      const injectedKey = apiKeys[i] || apiKeys[0] || "";

      try {
        const formData = new URLSearchParams();
        const receivedParams = {};
        const missingParams = [];

        // 🔁 Add payload params dynamically
        requiredParams.forEach((param) => {
          if (body[param] !== undefined && body[param] !== null) {
            formData.append(param, body[param]);
            receivedParams[param] = body[param];
          } else {
            missingParams.push(param);
          }
        });

        // 🔐 Always inject key
        if (injectedKey) {
          formData.append("key", injectedKey);
          receivedParams.key = injectedKey;
        } else {
          missingParams.push("key");
        }

        // 🔹 Final payload object
        const finalPayload = {};
        for (const [k, v] of formData.entries()) {
          finalPayload[k] = v;
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        let data;
        try {
          data = await response.json();
        } catch {
          data = await response.text();
        }

        results.push({
         
          data
        });

      } catch (error) {
        results.push({
          
          success: false,
          error: error.message
        });
      }
    }

    return res.json({
      success: true,
    
      results
    });

  } catch (err) {
    console.error("❌ executeUrls error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
