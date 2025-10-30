const dynamo = require('../config/dynamoClient');
const { v4: uuidv4 } = require('uuid');
const { PutCommand, GetCommand, DeleteCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.DYNAMODB_TABLE;

// CREATE
const saveWebsite = async (data) => {
  const timestamp = new Date().toISOString();
  const item = {
    id: data.id || uuidv4(),
    websiteName: data.websiteName || '',
    websiteUrl: data.websiteUrl || '',
    systemPrompt: Array.isArray(data.systemPrompt) ? data.systemPrompt : [],
    customPrompt: Array.isArray(data.customPrompt) ? data.customPrompt : [],
    category: Array.isArray(data.category) ? data.category : ['General'],
    urls: Array.isArray(data.urls) ? data.urls : [],
    library: Array.isArray(data.library) ? data.library : [],
    apiKey: data.apiKey || uuidv4(),
    status: data.status || 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return { success: true, message: 'Website saved', item };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// READ ALL
const getAllWebsites = async () => {
  try {
    const result = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }));
    return { success: true, items: result.Items };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// READ ONE
const getWebsiteById = async (id) => {
  try {
    const result = await dynamo.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    return result.Item ? { success: true, item: result.Item } : { success: false, error: 'Website not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE FULL WEBSITE
const updateWebsite = async (id, data) => {
  const timestamp = new Date().toISOString();
  try {
    const result = await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `
          SET websiteName = :name,
              websiteUrl = :url,
              systemPrompt = :sys,
              customPrompt = :custom,
              category = :cat,
              urls = :urls,
              library = :lib,
              #st = :status,
              updatedAt = :updatedAt
        `,
        ExpressionAttributeValues: {
          ':name': data.websiteName || '',
          ':url': data.websiteUrl || '',
          ':sys': Array.isArray(data.systemPrompt) ? data.systemPrompt : [],
          ':custom': Array.isArray(data.customPrompt) ? data.customPrompt : [],
          ':cat': Array.isArray(data.category) ? data.category : ['General'],
          ':urls': Array.isArray(data.urls) ? data.urls : [],
          ':lib': Array.isArray(data.library) ? data.library : [],
          ':status': data.status || 'active',
          ':updatedAt': timestamp,
        },
        ExpressionAttributeNames: { '#st': 'status' },
        ReturnValues: 'ALL_NEW',
      })
    );
    return { success: true, item: result.Attributes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE CUSTOM DATA ONLY (customPrompt, urls, library)
const updateWebsiteCustomData = async (id, data) => {
  const timestamp = new Date().toISOString();
  try {
    const result = await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `
          SET customPrompt = :customPrompt,
              urls = :urls,
              library = :library,
              updatedAt = :updatedAt
        `,
        ExpressionAttributeValues: {
          ':customPrompt': Array.isArray(data.customPrompt) ? data.customPrompt : [],
          ':urls': Array.isArray(data.urls) ? data.urls : [],
          ':library': Array.isArray(data.promptList) ? data.promptList : [],
          ':updatedAt': timestamp,
        },
        ReturnValues: 'ALL_NEW',
      })
    );
    return { success: true, item: result.Attributes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE STATUS ONLY
const updateWebsiteStatus = async (id, status) => {
  const timestamp = new Date().toISOString();
  try {
    const result = await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: 'SET #st = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: { ':status': status, ':updatedAt': timestamp },
        ReturnValues: 'ALL_NEW',
      })
    );
    return { success: true, item: result.Attributes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// DELETE
const deleteWebsite = async (id) => {
  try {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
    return { success: true, message: 'Website deleted' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  saveWebsite,
  getAllWebsites,
  getWebsiteById,
  updateWebsite,
  updateWebsiteCustomData,
  updateWebsiteStatus,
  deleteWebsite,
};
