# Automatically validate tenant isolation like Buy with Prime

[Attribute-based access control](https://aws.amazon.com/ko/blogs/security/how-to-implement-saas-tenant-isolation-with-abac-and-aws-iam/) is an authorization strategy that defines permissions based on attributes. This strategy is especially helpful for multi-tenant service providers because it provides a scalable and safe way to store and access their tenants’ data. The previous blog post in this series introduced how to use [aws:PrincipalTag](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html#condition-keys-principaltag)  to get started with ABAC. In this post, we will dive deep into how we can validate it in the testing phase. It is critical to have integration tests covering both positive and negative tenancy isolation cases. Unlike most other functionality, incorrectly configured authentication often appears to "work" from a functionality standpoint but actually doesn't work because it allows unauthorized callers to perform the function. The `buy-with-prime-automate-tenant-validation` is modeled after the test automation package that is used in Buy with Prime, Amazon's entity allowing U.S.-based Prime members to shop directly from participating online stores using the Prime shopping benefits they love and trust—including fast, free delivery, a seamless checkout experience, and easy returns. `buy-with-prime-automate-tenant-validation` will provide you with an automated way to run the integration tests against Amazon DynamoDB and help you add the integration test to your service.

## Understanding Multi-tenant architecture and test cases for isolation

Different service providers take different approaches to multi-tenant architectures. However, each multi-tenant implementation will have A) tenant metadata to help the service provider distinguish tenants from one another, and B) tenant-owned data that must be kept private to the tenant owner. It is crucial to isolate the access to the data by the tenant to provide a secure service to your customers. 

![](/img/data-store.png)


To ensure your application implemented the isolation correctly, you would have test the architecture at both dimensions. For tenant onboarding and metadata, the application should make sure the owner of the tenant can perform action to update their account information (i.e. tiers) which can bring downstream changes in your architecture. For instance, user A can’t delete user B’s account or upgrade/downgrade their tiers. In addition you would also enforce strict tenant isolation for their business data as well. You wouldn’t allow user A to read user B’s data. 

This blog post assumes an architecture where both sets of data reside in Amazon DynamoDB and explain how you can use `buy-with-prime-automate-tenant-validation` to automate the validation of ABAC based isolation. It uses IAM assume-role sessions to perform both positive and negative tests against your existing DynamoDB table to see if its policy is well defined only to allow a user to access nothing but their data.


## What does this repository do?

![](/img/test-runner.png)

`buy-with-prime-automate-tenant-validation` is a jest package which contains two logic — to assume a role with session tag and to perform operations against Amazon DynamoDB. The essence of test runner  `buy-with-prime-automate-tenant-validation` is that it creates two IAM Assume-Role session, one with the matching tenant identifier with the target data and the other with not matching id. The first session should successfully perform all the operations while the second one would fail with AccessDenied response.

## How to get started

### Prerequisites

1. Please set up AWS credential in the desired environment. It can be configuring AWS CLI in your local terminal or setting the right IAM Role for AWS compute resources such as Lambda.
2. Create an IAM Role which will be assumed to perform the test. Since the test itself will be mainly conducted for IAM Assume-role session’s tag, it is suggested that the role holds full access to the AWS service that you desire to test (i.e. DynamoDB)
3. Create sample data in the target with the mockup tenant Id. 

### Configure the test runner
1. Clone this repository
    ```
    git clone https://github.com/amzn/buy-with-prime-automate-tenant-validation.git
    cd buy-with-prime-automate-tenant-validation
    ```

2. Create a file named `.env` to set up the environment variables. It requires you to have the following fields. Keep in mind that this sample respoitory uses static credentials for the test purpose only.
    ```
    AWS_REGION=
    AWS_ACCESS_KEY=
    AWS_SECRET_ACCESS=
    AWS_ASSUME_ROLE_ARN= // The IAM Role ARN that is created as a part of prerequisite
    MATCHING_TENANT_ID="TEST_CORRECT_ID" // The tenant Id given to the sample data in the prerequisites
    NOT_MATCHING_TENANT_ID="X"
    AWS_TEST_DDB_TABLE_ARN= // You can choose to configure the test target table as a process environment
    ```

3. Run the test

    ```
    npm install
    npm test
    ```

## How to add customization test cases

Within the test tool repository, you will see assumeRoleByTag.js and ddbApi.js. While the core part of validating the assume-role session is defined in assumeRoleByTag.js , you can add your own test cases based after ddbApi. Once you complete writing the test logic, then you can add them to the test runner in Run.test.js Let’s see how this works with the example of AWS SecretsManager.


1. Create a new javascript file to add test logics. The following code block explains the suggested structure for additional test cases.
    ```
    // secretsManagerApi.js
    
    async function createSecret (credentials, tenantId, secretName) {
    // 1. Set the config to inject fake IAM assume role session
    const config = {region, credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.sessionToken
        }}
        
    // 2. Create the client for the AWS service that you want to test against, then run command
    const smClient = new SM.SecretsManagerClient(config)
        await sm.send(new CreateSecretsCommand({...}))
    }
    
    async function updateSecret (credentials, tenantId, secretName) {...}  
    async function deleteSecret (credentials, tenantId, secretName) {...}
    async function readSecret (credentials, tenantId, secretName) {...} 

    exports.createSecret = createSecret;
    exports.readSecret = readSecret;
    exports.updateSecret = updateSecret;
    exports.deleteSecret = deleteSecret;
    ```

2. Open Run.test.js to add the new test cases. Make sure you add both positive and negative test cases.
    ```
    describe("SecretsManager Multi-tenancy test" ()=> {
    test("CreateSecret should succeed when the request carries right tenantId and permission", async() => {
        const response = await secretsManagerApi.createSecret(...)
        expect(response).toBe(200)
    })
    
    test("CreateSecret should fail if the tenant id does not match", async () => {
        await expect(secretsManagerApi.createSecret(...))
                .rejects.toThrow(AccessDeniedException)
    })
    
    ....
        
    }) 
    ```
