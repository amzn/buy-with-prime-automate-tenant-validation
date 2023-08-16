const assumeRoleByTag = require("./assumeRolebyTag");
const ddbApis = require("./ddbApi");
const { describe } = require("node:test");

const AWS_ASSUME_ROLE_ARN = process.env.AWS_ASSUME_ROLE_ARN;
const AWS_TEST_TENANT_ID = process.env.AWS_TEST_TENANT_ID;
const AWS_WRONG_TEST_TENANT_ID = process.env.AWS_WRONG_TEST_TENANT_ID;
const AWS_TEST_DDB_TABLE = process.env.AWS_TEST_DDB_TABLE_NAME;
const time = Date.now();
let credentials = null;



console.log("TIME: "+time);
beforeAll(async () => {
  const response = await assumeRoleByTag(
    AWS_ASSUME_ROLE_ARN,
    AWS_TEST_TENANT_ID
  );
  expect(response).toEqual(
    expect.objectContaining({
      Credentials: expect.anything(),
    })
  );
  credentials = response?.Credentials;
});

describe("DDB Test", () => {
  /* CREATE DDB Item Test */
  test("CREATE DDB Item Success Test", async () => {
    const response = await ddbApis.createDDBItem(
      credentials,
      AWS_TEST_TENANT_ID,
      time,
      AWS_TEST_DDB_TABLE
    );
    expect(response).toBe(200);
  });
  test("CREATE DDB Item Fail Test", async () => {
    await expect(
      ddbApis.createDDBItem(
        credentials,
        AWS_WRONG_TEST_TENANT_ID,
        time,
        AWS_TEST_DDB_TABLE
      )
    ).rejects.toThrow("AccessDeniedException");
  });

  /* READ DDB Item Test */
  test("Read DDB Item Success Test", async () => {
    let response = await ddbApis.readDDBItem(
      credentials,
      AWS_TEST_TENANT_ID,
      time,
      AWS_TEST_DDB_TABLE
    );
    expect(response).toEqual(
      expect.objectContaining({
        Item: expect.anything(),
      })
    );
  });

  test("Read DDB Item Fail Test", async () => {
    await expect(
      ddbApis.readDDBItem(
        credentials,
        AWS_WRONG_TEST_TENANT_ID,
        time,
        AWS_TEST_DDB_TABLE
      )
    ).rejects.toThrow("AccessDeniedException");
  });

   /* Update DDB Item Test */
  test("Update DDB Item Success Test", async () => {
    const parameters ={
        key:"order_id",
        value:"success test id"
    }
    const response = await ddbApis.deleteDDBItem(
      credentials,
      AWS_TEST_TENANT_ID,
      time,
      AWS_TEST_DDB_TABLE,
      parameters
    );
    expect(response).toBe(200);
  });
  test("Update DDB Item Fail Test", async () => {
    const parameters ={
        key:"order_id",
        value:"faile test id"
    }
    await expect(ddbApis.updateDDBItem(
      credentials,
      AWS_WRONG_TEST_TENANT_ID,
      time,
      AWS_TEST_DDB_TABLE,
      parameters
    )).rejects.toThrow("AccessDeniedException");
  });
  
  /* DELETE DDB Item Test */
  test("Delete DDB Item Fail Test", async () => {
    await expect(ddbApis.deleteDDBItem(
      credentials,
      AWS_WRONG_TEST_TENANT_ID,
      time,
      AWS_TEST_DDB_TABLE
    )).rejects.toThrow("AccessDeniedException");
  });

  test("Delete DDB Item Success Test", async () => {
    const response = await ddbApis.deleteDDBItem(
      credentials,
      AWS_TEST_TENANT_ID,
      time,
      AWS_TEST_DDB_TABLE
    );
    expect(response).toBe(200);
  });
});
