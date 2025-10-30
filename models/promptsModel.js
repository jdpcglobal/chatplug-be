const {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const dynamo = require("../config/dynamoClient");

const TABLE_NAME = "Childprompt";

/**
 * ✅ Save or Update a prompt set
 */
exports.saveOrUpdatePromptSet = async (data) => {
  const now = new Date().toISOString();
  const item = {
    pk: `website#${data.websiteId}`,
    sk: `prompt#${data.promptName}`,
    websiteId: data.websiteId,
    promptName: data.promptName,
    promptList: data.promptList || [],
    prompts: data.prompts || [],
    urls: data.urls || [],
    createdAt: now,
    updatedAt: now,
  };

  await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
};

/**
 * ✅ Get a single prompt set
 */
exports.getPromptSet = async (websiteId, promptName) => {
  const pk = `website#${websiteId}`;
  const sk = `prompt#${promptName}`;

  const result = await dynamo.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { pk, sk } })
  );
  return result.Item;
};

/**
 * ✅ List all prompts for a given website
 */
exports.listPromptSets = async (websiteId) => {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "websiteId = :w",
      ExpressionAttributeValues: { ":w": websiteId },
    })
  );
  return result.Items || [];
};

/**
 * ✅ Update ONLY the promptName
 * This version trims all parameters to avoid issues like "sdsad\n"
 */
exports.updatePromptName = async (websiteId, oldPromptName, newPromptName) => {
  // 🧹 Trim to avoid trailing spaces/newlines
  websiteId = websiteId.trim();
  oldPromptName = oldPromptName.trim();
  newPromptName = newPromptName.trim();

  const pk = `website#${websiteId}`;
  const oldSk = `prompt#${oldPromptName}`;
  const now = new Date().toISOString();

  // Fetch existing item
  const { Item } = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { pk, sk: oldSk },
    })
  );

  if (!Item) {
    throw new Error(`Prompt "${oldPromptName}" not found for website ${websiteId}`);
  }

  // Check if the new name already exists (to prevent accidental overwrite)
  const newSk = `prompt#${newPromptName}`;
  const existing = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { pk, sk: newSk },
    })
  );

  if (existing.Item) {
    throw new Error(`Prompt "${newPromptName}" already exists for website ${websiteId}`);
  }

  // Create the updated item
  const newItem = {
    ...Item,
    sk: newSk,
    promptName: newPromptName,
    updatedAt: now,
  };

  // Save new record
  await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: newItem }));

  // Delete old record
  await dynamo.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { pk, sk: oldSk } })
  );

  return newItem;
};

/**
 * ✅ Update prompt details (fields other than promptName)
 */
exports.updatePromptSet = async (websiteId, promptName, updateData) => {
  websiteId = websiteId.trim();
  promptName = promptName.trim();

  const pk = `website#${websiteId}`;
  const sk = `prompt#${promptName}`;
  const now = new Date().toISOString();

  const result = await dynamo.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { pk, sk },
      UpdateExpression:
        "set promptList = :pl, prompts = :p, urls = :u, updatedAt = :ua",
      ExpressionAttributeValues: {
        ":pl": updateData.promptList || [],
        ":p": updateData.prompts || [],
        ":u": updateData.urls || [],
        ":ua": now,
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes;
};

/**
 * ✅ Delete a prompt set
 */
exports.deletePromptSet = async (websiteId, promptName) => {
  websiteId = websiteId.trim();
  promptName = promptName.trim();

  const pk = `website#${websiteId}`;
  const sk = `prompt#${promptName}`;

  await dynamo.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { pk, sk } }));
  return { message: "Prompt deleted successfully" };
};
