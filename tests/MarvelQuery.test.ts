import { generateMock } from "@anatine/zod-mock";
import nock from "nock";

import MarvelQuery, { Config, Endpoint, EndpointType } from "../src";

import { endpointTypes, MockAPI } from "./MockAPI";
import { MarvelQueryFetched } from "../src/models/types/interface";

export const mockKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

export const config: Partial<Config<boolean>> = {
  isTestEnv: true,
  logOptions: {
    // verbose: true,
  },
  validation: {
    autoQuery: false,
  },
};

let createAutoQuery = MarvelQuery.init(mockKeys, config);
let createStandardQuery = MarvelQuery.init(mockKeys, {
  ...config,
  autoQuery: false,
});

export const queryModes = [
  { method: createAutoQuery, name: "AutoQuery" },
  { method: createStandardQuery, name: "Standard Query" },
];

let mock: MockAPI;

describe("MarvelQuery", () => {
  beforeAll(async () => {
    mock = await MockAPI.startServer();
  });

  afterAll(() => {
    mock.endAll();
  });

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
    const createQuery = MarvelQuery.init(mockKeys, {
      ...config,
      autoQuery: true,
    });
    test("Searching for Comics", async () => {
      const query = createQuery(["comics"], { titleStartsWith: "Spider" });
      const result = (await query.fetch()).results[0];
      // result.characters.
    });
  });
});
