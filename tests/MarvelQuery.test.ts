import MarvelQuery, { ConfigOptions, DisableAutoQuery, ShowHiddenProperties } from "../src";

export const mockKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

export const config: Partial<ConfigOptions<DisableAutoQuery, ShowHiddenProperties>> = {
  showHiddenProperties: true,
  isTestEnv: true,
  logOptions: {
    // verbose: true,
  }
};

export const createAutoQuery = MarvelQuery.init(mockKeys, config);
export const createStandardQuery = MarvelQuery.init(mockKeys, {
  ...config,
  autoQuery: false,
});

export const queryModes = [
  { method: createAutoQuery, name: "AutoQuery" },
  { method: createStandardQuery, name: "Standard Query" },
];

describe("MarvelQuery", () => {
  // Create a new instance of MarvelQuery with an EndpointType
  test.each(queryModes)(
    "should create an instance with an EndpointType ($name)",
    ({ method }) => {
      const query = method("characters", { name: "Peter Parker" });
      expect(query).toBeInstanceOf(MarvelQuery);
    }
  );

  // Create a new instance of MarvelQuery with an Endpoint
  test.each(queryModes)(
    "should create an instance with an Endpoint ($name)",
    ({ method }) => {
      const query = method(["characters"], { name: "Peter Parker" });
      expect(query).toBeInstanceOf(MarvelQuery);
    }
  );

  // Build a valid URL
  test.each(queryModes)(
    "should build a valid URL with endpoint, API keys, and parameters ($name)",
    ({ method }) => {
      const query = method("characters", { name: "Peter Parker" });
      const url = query.buildURL();
      expect(url).toContain("/characters");
      expect(url).toContain("apikey=mockPublicKey");
      expect(url).toContain("name=Peter+Parker");
    }
  );

  describe("Testing for specific data types, with AutoQuery enabled", () => {
    const query = MarvelQuery.init(mockKeys, {
      ...config,
      autoQuery: true,
    });
    test("Searching for Comics", async () => {
      const spiderQuery = query(["comics"], { titleStartsWith: "Spider" });
      const result = (await spiderQuery.fetch()).results[0];
      // result.characters.
    });
  });

  describe("Verify that resultHistory is working as expected", () => {
    const query = MarvelQuery.init(mockKeys, {
      ...config,
      autoQuery: true,
      globalParams: { all: { limit: 10 } },
    });
    test("Should store the results of a query", async () => {
      const spiderQuery = query(["comics"], { titleStartsWith: "Spider" });
      const resultA = (await spiderQuery.fetch()).results;
      const resultB = (await spiderQuery.fetch()).results;

      expect(spiderQuery.resultHistory).toHaveLength(resultA.length + resultB.length);
      expect(spiderQuery.resultHistory).toEqual([...resultA, ...resultB]);
    });
  });
});
