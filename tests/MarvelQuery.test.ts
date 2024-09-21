import { generateMock } from "@anatine/zod-mock";
import nock from "nock";
import {
  ResultSchemaMap,
  MarvelCharacterSchema,
  MarvelComicSchema,
} from "../src/models/schemas/data-schemas";

import MarvelQuery, { APIResponseData } from "../src";
import { verbose } from "winston";
import { mock } from "node:test";

const mockKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

const logOptions = {
  verbose: false,
}

let createQueryWithAQ = MarvelQuery.init(mockKeys,{
  isTestEnv: true,
  logOptions,
});
let createQueryStandard = MarvelQuery.init(mockKeys, {
  isTestEnv: true,
  autoQuery: false,
  logOptions,
});

describe("MarvelQuery", () => {
  let testCases = [
    { method: createQueryWithAQ, name: "AutoQuery" },
    { method: createQueryStandard, name: "Standard query" },
  ];

  beforeAll(() => {

    // Mock the Marvel API
    const marvelAPI = nock("https://gateway.marvel.com/v1/public");

    const setupMockEndpoint = (
      scope: nock.Scope,
      path: string | RegExp,
      mockData: any
    ) => {

      const response: APIResponseData = {
        offset: 0,
        limit: 20,
        total: 1,
        count: 1,
      }

      console.log(mockData.comics?.items[0]);

      scope
        .get(path)
        .query(true) // Match any query parameters
        .reply(200, {
          data: {
            ...response,
            results: [mockData],
          },
        });
    };

    // Setup mock endpoints for all possible endpoints with mock data of the correct type
    Object.entries(ResultSchemaMap).forEach(([key, schema]) => {
      const mockData = generateMock(schema);

      setupMockEndpoint(marvelAPI, `/${key}`, mockData);
      setupMockEndpoint(marvelAPI, new RegExp(`/${key}/.*`), mockData);
      setupMockEndpoint(marvelAPI, new RegExp(`/.*?/.*?/${key}`), mockData);
    });
  });

  //
  afterAll(() => {
    nock.cleanAll();
  });

  // Create a new instance of MarvelQuery with an EndpointType
  test.each(testCases)(
    "$name should create an instance with an EndpointType",
    ({ method }) => {
      const query = method("characters", { name: "Peter Parker" });
      expect(query).toBeInstanceOf(MarvelQuery);
    }
  );

  // Create a new instance of MarvelQuery with an Endpoint
  test.each(testCases)(
    "$name should create an instance with an Endpoint",
    ({ method }) => {
      const query = method(["characters"], { name: "Peter Parker" });
      expect(query).toBeInstanceOf(MarvelQuery);
    }
  );

  // Build a valid URL
  test.each(testCases)(
    "$name should build a valid URL with endpoint, API keys, and parameters",
    ({ method }) => {
      const query = createQueryWithAQ("characters", { name: "Peter Parker" });
      const url = query.buildURL();
      expect(url).toContain("/characters");
      expect(url).toContain("apikey=mockPublicKey");
      expect(url).toContain("name=Peter+Parker");
    }
  );

  it("should return comics whose title starts with 'Amazing' (standard query)", async () => {
    const query = await createQueryStandard("comics", {
      titleStartsWith: "Amazing",
    }).fetch();

    // Validate using zod schema
    const results = query.results;
    results.forEach((result: any) => {
      const validationResult = MarvelComicSchema.safeParse(result);
      // Check if the validation passed
      if (!validationResult.success) {
        console.error("Validation Errors:", validationResult.error.format());
        console.error("Schema:", MarvelComicSchema);
        console.error("Data being validated:", result);
      }
      expect(validationResult.success).toBe(true);
    });
  });

  it("should return a single character named Peter Parker (standard query)", async () => {
    const result = await createQueryStandard("characters", {
      name: "Peter Parker",
    }).fetchSingle();

    // Validate using zod schema
    const validationResult = MarvelCharacterSchema.safeParse(result);
    // Check if the validation passed
    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.format());
      console.error("Schema:", MarvelCharacterSchema);
      console.error("Data being validated:", result);
    }

    expect(validationResult.success).toBe(true);
  });

  it("should return a single character named Peter Parker (AutoQuery)", async () => {
    const result = await createQueryWithAQ("characters", {
      name: "Peter Parker",
    }).fetchSingle();

    // Validate using zod schema
    const validationResult = MarvelCharacterSchema.safeParse(result);
    // Check if the validation passed
    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.format());
      console.error("Schema:", MarvelCharacterSchema);
      console.error("Data being validated:", result);
    }

    expect(validationResult.success).toBe(true);
  });
});
