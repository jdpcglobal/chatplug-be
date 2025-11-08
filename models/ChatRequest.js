// models/ChatRequest.js
const dynamo = require('../config/dynamoClient');

const TABLE_NAME = "ChatRequest";
const { 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand, 
  DeleteCommand,
  ScanCommand
} = require('@aws-sdk/lib-dynamodb');

class ChatRequest {
  // Create new chat request
  static async create(chatData) {
    const {
      websiteId,
      collectedData,
      backendApiKey, // ✅ NEW FIELD
      status = 'pending',
      createdAt = new Date().toISOString(),
      updatedAt = new Date().toISOString()
    } = chatData;

    // Generate unique ID
    const id = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const item = {
      id,
      type: 'chat-request',
      websiteId,
      collectedData: this.formatCollectedData(collectedData),
      backendApiKey, // ✅ NEW FIELD
      status,
      createdAt,
      updatedAt
    };

    const params = {
      TableName: TABLE_NAME,
      Item: item
    };

    try {
      await dynamo.send(new PutCommand(params));
      console.log('✅ Chat request saved to DynamoDB:', id);
      return item;
    } catch (error) {
      console.error('❌ DynamoDB Put Error:', error);
      throw new Error(`Error creating chat request: ${error.message}`);
    }
  }

  // Format collected data for better storage
  static formatCollectedData(collectedData) {
    if (typeof collectedData === 'string') {
      try {
        collectedData = JSON.parse(collectedData);
      } catch {
        return { customData: collectedData };
      }
    }

    if (typeof collectedData !== 'object' || collectedData === null) {
      return { customData: collectedData };
    }

    return collectedData;
  }

  // Get chat requests by website ID
  static async getByWebsiteId(websiteId, limit = 50) {
    try {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'websiteId-index',
        KeyConditionExpression: 'websiteId = :websiteId',
        ExpressionAttributeValues: {
          ':websiteId': websiteId
        },
        Limit: limit,
        ScanIndexForward: false
      };

      const result = await dynamo.send(new QueryCommand(params));
      return result.Items || [];
    } catch (error) {
      console.error('❌ GSI Query failed, falling back to scan:', error.message);
      return await this.getAll(limit);
    }
  }

  // ✅ NEW: Get chat requests by backendApiKey
  static async getByBackendApiKey(backendApiKey, limit = 50) {
    try {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'backendApiKey-index', // You'll need to create this GSI
        KeyConditionExpression: 'backendApiKey = :backendApiKey',
        ExpressionAttributeValues: {
          ':backendApiKey': backendApiKey
        },
        Limit: limit,
        ScanIndexForward: false
      };

      const result = await dynamo.send(new QueryCommand(params));
      return result.Items || [];
    } catch (error) {
      console.error('❌ BackendApiKey GSI Query failed, falling back to scan:', error.message);
      
      // Fallback to scan if GSI doesn't exist
      const scanParams = {
        TableName: TABLE_NAME,
        Limit: limit,
        FilterExpression: 'backendApiKey = :backendApiKey',
        ExpressionAttributeValues: {
          ':backendApiKey': backendApiKey
        }
      };

      try {
        const scanResult = await dynamo.send(new ScanCommand(scanParams));
        return scanResult.Items || [];
      } catch (scanError) {
        console.error('❌ Scan also failed:', scanError);
        throw new Error(`Error fetching chat requests by backendApiKey: ${scanError.message}`);
      }
    }
  }

  // Get chat request by ID
  static async getById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    try {
      const result = await dynamo.send(new GetCommand(params));
      return result.Item || null;
    } catch (error) {
      console.error('❌ DynamoDB Get Error:', error);
      throw new Error(`Error fetching chat request: ${error.message}`);
    }
  }

  // Update chat request status
  static async updateStatus(id, status) {
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await dynamo.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (error) {
      console.error('❌ DynamoDB Update Error:', error);
      throw new Error(`Error updating chat request: ${error.message}`);
    }
  }

  // Get all chat requests (for admin)
  static async getAll(limit = 100) {
    try {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'type-index',
        KeyConditionExpression: 'type = :type',
        ExpressionAttributeValues: {
          ':type': 'chat-request'
        },
        Limit: limit,
        ScanIndexForward: false
      };

      const result = await dynamo.send(new QueryCommand(params));
      return result.Items || [];
    } catch (error) {
      console.error('❌ GSI Query failed, falling back to scan:', error.message);
      
      const scanParams = {
        TableName: TABLE_NAME,
        Limit: limit,
        FilterExpression: '#type = :type',
        ExpressionAttributeNames: {
          '#type': 'type'
        },
        ExpressionAttributeValues: {
          ':type': 'chat-request'
        }
      };

      try {
        const scanResult = await dynamo.send(new ScanCommand(scanParams));
        return scanResult.Items || [];
      } catch (scanError) {
        console.error('❌ Scan also failed:', scanError);
        throw new Error(`Error fetching all chat requests: ${scanError.message}`);
      }
    }
  }

  // Get chat requests by status
  static async getByStatus(status, limit = 50) {
    try {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'type-index',
        KeyConditionExpression: 'type = :type',
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':type': 'chat-request',
          ':status': status
        },
        Limit: limit,
        ScanIndexForward: false
      };

      const result = await dynamo.send(new QueryCommand(params));
      return result.Items || [];
    } catch (error) {
      console.error('❌ Status query failed, using getAll with filter:', error.message);
      
      const allRequests = await this.getAll(1000);
      return allRequests
        .filter(req => req.status === status)
        .slice(0, limit);
    }
  }

  // Delete chat request
  static async delete(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    try {
      await dynamo.send(new DeleteCommand(params));
      console.log('✅ Chat request deleted:', id);
      return { message: 'Chat request deleted successfully' };
    } catch (error) {
      console.error('❌ DynamoDB Delete Error:', error);
      throw new Error(`Error deleting chat request: ${error.message}`);
    }
  }

  // Test connection and table
  static async testConnection() {
    try {
      const result = await dynamo.send(new ScanCommand({
        TableName: TABLE_NAME,
        Limit: 1
      }));
      return { connected: true, items: result.Items || [] };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
}

module.exports = ChatRequest;