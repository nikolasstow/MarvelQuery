import { generateMock } from "@anatine/zod-mock";
import { faker } from "@faker-js/faker";
import nock from "nock";
import {
  ResultSchemaMap,
  MarvelCharacterSchema,
  MarvelComicSchema,
} from "../src/models/schemas/data-schemas";

import MarvelQuery from "../src";

const mockKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

let createQueryWithAQ = MarvelQuery.init(mockKeys,{
  isTestEnv: true,
});
let createQueryStandard = MarvelQuery.init(mockKeys, {
  isTestEnv: true,
  autoQuery: false,
});

describe("MarvelQuery", () => {
  let testCases = [
    { method: createQueryWithAQ, name: "AutoQuery" },
    { method: createQueryStandard, name: "Standard query" },
  ];

  beforeAll(() => {
    const marvelAPI = nock("https://gateway.marvel.com/v1/public");

    const setupMockEndpoint = (
      scope: nock.Scope,
      path: string | RegExp,
      mockData: any
    ) => {
      scope
        .get(path)
        .query(true) // Match any query parameters
        .reply(200, {
          data: {
            results: [mockData],
          },
        });
    };

    Object.entries(ResultSchemaMap).forEach(([key, schema]) => {
      const mockData = generateMock(schema);

      setupMockEndpoint(marvelAPI, `/${key}`, mockData);
      setupMockEndpoint(marvelAPI, new RegExp(`/${key}/.*`), mockData);
      setupMockEndpoint(marvelAPI, new RegExp(`/.*?/.*?/${key}`), mockData);
    });
  });

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

  it("should return comics whose title starts with 'Amazing'", async () => {
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

  it("should return a single character named Peter Parker", async () => {
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
});
