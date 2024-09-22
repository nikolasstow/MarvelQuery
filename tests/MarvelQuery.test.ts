import { generateMock } from "@anatine/zod-mock";
import nock from "nock";
import {
  MarvelComicSchema,
  ResultSchemaMap,
} from "../src/models/schemas/data-schemas";

import MarvelQuery, {
  AnyParams,
  APIBaseParams,
  APIResponseData,
  CreateQueryFunction,
  Endpoint,
  EndpointType,
} from "../src";
import { z } from "zod";

const mockKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

const logOptions = {
  // verbose: true,
};

let createQueryWithAQ = MarvelQuery.init(mockKeys, {
  isTestEnv: true,
  logOptions,
});
let createQueryStandard = MarvelQuery.init(mockKeys, {
  isTestEnv: true,
  autoQuery: false,
  logOptions,
});

describe("MarvelQuery", () => {
  let queryModes = [
    { method: createQueryWithAQ, name: "AutoQuery" },
    { method: createQueryStandard, name: "Standard query" },
  ];

  let endpointTypes: Array<EndpointType> = [
    "characters",
    "comics",
    "creators",
    "events",
    "series",
    "stories",
  ];

  // Array of possible endpoints
  let endpoints: Array<Endpoint | EndpointType> = [...endpointTypes];

  for (let typeA of endpointTypes) {
    for (let typeB of endpointTypes) {
      if (typeA == typeB) continue;
      const randomCount = Math.floor(Math.random() * 999) + 1;
      endpoints.push([typeA, randomCount, typeB] as Endpoint);
    }
  }

  let tests: {
    method: CreateQueryFunction<boolean>;
    name: string;
    endpoint: Endpoint | EndpointType;
  }[] = [];

  for (let mode of queryModes) {
    for (let endpoint of endpoints) {
      const endpointString = Array.isArray(endpoint)
        ? endpoint.join("/")
        : endpoint;
      tests.push({
        method: mode.method,
        name: `${endpointString} (${mode.name})`,
        endpoint: endpoint,
      });
    }
  }

  beforeAll(() => {
    // Mock the Marvel API
    const marvelAPI = nock("https://gateway.marvel.com/v1/public");

    const queryCache = new Map<string, number>();

    const setupMockEndpoint = (
      scope: nock.Scope,
      path: string | RegExp,
      schema: z.ZodType
    ) => {
      scope
        .persist()
        .get(path)
        .query(true) // Match any query parameters
        .reply((uri, requestBody, cb) => {
          const url = new URL(uri, "https://gateway.marvel.com");

          // Extract parameters excluding offset and limit
          let { offset, limit, ...params } = url.searchParams as APIBaseParams &
            AnyParams;

          // Generate a key for the query cache
          const key = JSON.stringify({ ...params, pathname: url.pathname });

          let total: number = 0;

          // Check if the query (minus offset and limit) has been cached. This ensure the total count is consistent.
          if (queryCache.has(key)) {
            total = queryCache.get(key)!;
          } else {
            total = Math.floor(Math.random() * 100) + 1; // Random count between 1 and 100
            queryCache.set(key, total);
          }

          limit = Number(url.searchParams.get("limit") || 20);
          offset = Number(url.searchParams.get("offset") || 0);

          // Count is the limit or the total, whichever is smaller
          const count = Math.min(limit, total);

          const response: APIResponseData = {
            offset,
            limit,
            total,
            count,
          };

          const results = Array.from({ length: limit }, () =>
            generateMock(schema)
          );

          cb(null, [
            200,
            {
              data: {
                ...response,
                results,
              },
            },
          ]);
        });
    };

    // Setup mock endpoints for all possible endpoints with mock data of the correct type
    Object.entries(ResultSchemaMap).forEach(([type, schema]) => {
      // Mock Collection Endpoints
      for (let endpointType of endpointTypes) {
        setupMockEndpoint(
          marvelAPI,
          new RegExp(`/${endpointType}/.*?/${type}`),
          schema
        );
      }

      // Mock Category Endpoints
      setupMockEndpoint(marvelAPI, `/${type}`, schema);

      // Mock Resource Endpoints
      setupMockEndpoint(marvelAPI, new RegExp(`/${type}/\\d+$`), schema);
    });
  });

  afterAll(() => {
    nock.cleanAll();
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
      const query = createQueryWithAQ("characters", { name: "Peter Parker" });
      const url = query.buildURL();
      expect(url).toContain("/characters");
      expect(url).toContain("apikey=mockPublicKey");
      expect(url).toContain("name=Peter+Parker");
    }
  );

  test.each(tests)(
    "should query the Marvel API at endpoint $name",
    async ({ method, endpoint }) => {
      const query = method(endpoint, { limit: 5 });
      const results = await query.fetch();
    }
  );

  // it("should return comics whose title starts with 'Amazing' (standard query)", async () => {
  //   const query = await createQueryStandard(["creators", 698, "comics"], {
  //     titleStartsWith: "Amazing",
  //   }).fetch();

  // });

  // it("should return a single character named Peter Parker (standard query)", async () => {
  //   const result = await createQueryStandard("characters", {
  //     name: "Peter Parker",
  //   }).fetchSingle();

  //   // Validate using zod schema
  //   const validationResult = MarvelCharacterSchema.safeParse(result);
  //   // Check if the validation passed
  //   if (!validationResult.success) {
  //     console.error("Validation Errors:", validationResult.error.format());
  //     console.error("Schema:", MarvelCharacterSchema);
  //     console.error("Data being validated:", result);
  //   }

  //   expect(validationResult.success).toBe(true);
  // });

  // it("should return a single character named Peter Parker (AutoQuery)", async () => {
  //   const result = await createQueryWithAQ("characters", {
  //     name: "Peter Parker",
  //   }).fetchSingle();

  //   // Validate using zod schema
  //   const validationResult = MarvelCharacterSchema.safeParse(result);
  //   // Check if the validation passed
  //   if (!validationResult.success) {
  //     console.error("Validation Errors:", validationResult.error.format());
  //     console.error("Schema:", MarvelCharacterSchema);
  //     console.error("Data being validated:", result);
  //   }

  //   expect(validationResult.success).toBe(true);
  // });
});
