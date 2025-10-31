const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config(); // make sure .env is loaded

// Configure AWS DynamoDB client
const client = new DynamoDBClient({
  region: process.env.REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

// Use DocumentClient wrapper
const dynamo = DynamoDBDocumentClient.from(client);

module.exports = dynamo;