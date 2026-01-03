const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Store these in your .env file
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store your Gemini API key here

// AI Response Generation API
router.post('/generate-ai-response', async (req, res) => {
  try {
    const { question, websiteTitle, categories } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured'
      });
    }

    // Construct the prompt
    const systemPrompt = `You are a support assistant for ${websiteTitle || 'Support'}. ${
      categories && categories.length > 0 
        ? `You must ONLY answer questions related to these categories: ${categories.join(', ')}. ` 
        : ''
    }Provide a short, helpful, and relevant answer. If the question is not related to your categories, politely explain that you can only help with category-related questions.\n\n${question}`;

    // Call Gemini API using stored URL and API key
    const geminiResponse = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "Sorry, I couldn't generate a response.";

    res.json({
      success: true,
      response: responseText
    });

  } catch (error) {
    console.error('Error generating AI response:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error processing AI request'
    });
  }
});

module.exports = router;