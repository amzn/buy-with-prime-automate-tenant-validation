const STS = require("@aws-sdk/client-sts");
require('dotenv').config()

const AWS_REGION = process.env.AWS_REGION;

async function assumeRoleByTag(roleArn, tenantId){
    const config = {
      region: AWS_REGION
    };

    if (process.env.AWS_ACCESS_KEY) {
        config.credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS,
        };
    }

    const client = new STS.STSClient(config);
    const command = new STS.AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName:"auth-abac-test-session",
        Tags:[
            {
                Key:"tenant_id",
                Value:tenantId,
            },
        ]
    })
    try{
        const response = client.send(command);
        return response;
    }catch(e){
        return e;
    }
}
module.exports = assumeRoleByTag;