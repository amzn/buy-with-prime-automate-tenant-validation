const DDB = require("@aws-sdk/client-dynamodb");
const AWS_REGION = process.env.AWS_REGION;

// Function to create a new item in DynamoDB
async function createDDBItem(credentials, tenantId, time, tableName) {
  const config = {
    region: AWS_REGION,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
  };
  const ddbClient = new DDB.DynamoDBClient(config);
  const input = {
    TableName: tableName,
    Item: {
      tenant_id: {
        S: tenantId,
      },
      updated_at: {
        S: time.toString(),
      },
      created_at: {
        S: time.toString(),
      },
    },
  };
  const command = new DDB.PutItemCommand(input);

  try {
    const response = await ddbClient.send(command);
    return response.$metadata.httpStatusCode;
  } catch (e) {
    throw new Error(e.__type);
  }
}

// Function to read an item from DynamoDB
async function readDDBItem(credentials, tenantId, time, tableName) {
  const config = {
    region: AWS_REGION,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
  };

  const ddbClient = new DDB.DynamoDBClient(config);

  const input = {
    TableName: tableName,
    Key: {
      'tenant_id': {
        S: tenantId,
      }
    },
  };
  const command = new DDB.GetItemCommand(input);
  try {
    const response = await ddbClient.send(command);
    return response;
  } catch (e) {
    throw new Error(e.__type);
  }
}

// Function to update an item in DynamoDB
async function updateDDBItem(credentials, tenantId, time, tableName, parameters) {
    const config = {
      region: AWS_REGION,
      credentials: {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken,
      },
    };
  
    const ddbClient = new DDB.DynamoDBClient(config);
    const input = {
      ExpressionAttributeNames: {
        "#O": parameters.key,
      },
      ExpressionAttributeValues: {
        ":o": {
          S: parameters.value,
        },
      },
      TableName: tableName,
      Key: {
        tenant_id: {
          S: tenantId,
        }
      },
      "UpdateExpression": "SET #O = :o"
    };
    const command = new DDB.UpdateItemCommand(input);
    try {
      const response = await ddbClient.send(command);
      return response.$metadata.httpStatusCode;
    } catch (e) {
      throw new Error(e.__type);
    }
  }

// Function to delete an item from DynamoDB
async function deleteDDBItem(credentials, tenantId, time, tableName) {
    const config = {
      region: AWS_REGION,
      credentials: {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken,
      },
    };
  
    const ddbClient = new DDB.DynamoDBClient(config);
  
    const input = {
      TableName: tableName,
      Key: {
        'tenant_id': {
          S: tenantId,
        }
      },
    };
    const command = new DDB.DeleteItemCommand(input);
    try {
      const response = await ddbClient.send(command);
      return response.$metadata.httpStatusCode;
    } catch (e) {
      throw new Error(e.__type);
    }
  }

// Export the functions for use in other modules
exports.createDDBItem = createDDBItem;
exports.readDDBItem = readDDBItem;
exports.updateDDBItem = updateDDBItem;
exports.deleteDDBItem = deleteDDBItem;
