# Automatically validate tenant isolation like Buy with Prime

[Attribute-based access control](https://aws.amazon.com/ko/blogs/security/how-to-implement-saas-tenant-isolation-with-abac-and-aws-iam/) is an authorization strategy that defines permissions based on attributes. This strategy is especially helpful for multi-tenant service providers because it provides a scalable and safe way to store and access their tenants’ data. The previous blog post in this series introduced how to use [aws:PrincipalTag](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html#condition-keys-principaltag)  to get started with ABAC. In this post, we will dive deep into how we can validate it in the testing phase. It is critical to have integration tests covering both positive and negative tenancy isolation cases. Unlike most other functionality, incorrectly configured authentication often appears to "work" from a functionality standpoint but actually doesn't work because it allows unauthorized callers to perform the function. The THIS_TOOL_TO_BE_RENAMED is modeled after the test automation package that is used in Buy with Prime, Amazon's entity allowing U.S.-based Prime members to shop directly from participating online stores using the Prime shopping benefits they love and trust—including fast, free delivery, a seamless checkout experience, and easy returns. THIS_TOOL_TO_BE_RENAMED will provide you with an automated way to run the integration tests against Amazon DynamoDB and help you add the integration test to your service.

## Understanding Multi-tenant architecture and test cases for isolation

There can be a lot of ways to implement multi-tenant architecture, but in terms of the characteristics of the data the main set can be divided into two — tenant metadata for maintenance purpose for the service provider and the actual data storage for individual tenants. It is crucial to isolate the access to the data by the tenant to provide a secure service to your customers. 

![](/img/data-store.png)


To ensure your application implemented the isolation correctly, you would have test the architecture at both dimensions. For tenant onboarding and metadata, the application should make sure the owner of the tenant can perform action to update their account information (i.e. tiers) which can bring downstream changes in your architecture. For instance, user A can’t delete user B’s account or upgrade/downgrade their tiers. In addition you would also enforce strict tenant isolation for their business data as well. You wouldn’t allow user A to read user B’s data. 

This blog post assumes an architecture where both sets of data reside in Amazon DynamoDB and explain how you can use THIS_TOOL_TO_BE_RENAMED to automate the validation of ABAC based isolation. It uses IAM assume-role sessions to perform both positive and negative tests against your existing DynamoDB table to see if its policy is well defined only to allow a user to access nothing but their data.


## What does this repository do?

![](/img/test-runner.png)

THIS_TOOL_TO_BE_RENAMED is a jest package which contains two logic — to assume a role with session tag and to perform operations against Amazon DynamoDB. The essence of test runner  THIS_TOOL_TO_BE_RENAMED is that it creates two IAM Assume-Role session, one with the matching tenant identifier with the target data and the other with not matching id. The first session should successfully perform all the operations while the second one would fail with AccessDenied response.


## How to get started

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
    AWS_ASSUME_ROLE_ARN=
    AWS_TEST_TENANT_ID=
    AWS_WRONG_TEST_TENANT_ID=
    AWS_TEST_DDB_TABLE_NAME=
    ```

3. Run the test

    ```
    npm install
    npm test
    ```

