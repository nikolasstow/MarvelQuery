import { generateMock } from "@anatine/zod-mock";
import nock from "nock";

import MarvelQuery, {
  Config,
  CreateQueryFunction,
  Endpoint,
  EndpointType,
} from "../src";

import { ResultSchemaMap } from "../src/models/schemas/data-schemas";
import { EndpointBuilder } from "../src/utils/EndpointBuilder";
import { ValidateParams } from "../src/models/schemas/param-schemas";
import { setupMockEndpoint } from "./setupMockEndpoint";
import { AsEndpoint } from "../src/models/types/endpoint-types";
import { MarvelQueryFetched } from "../src/models/types/interface";

const mockKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

const config: Partial<Config<boolean>> = {
  isTestEnv: true,
  logOptions: {
    // verbose: true,
  },
};

const Query = {
  autoQuery: MarvelQuery.init(mockKeys, config),
  standard: MarvelQuery.init(mockKeys, {
    ...config,
    autoQuery: false,
  }),
};

const queryModes = [
  { method: Query.autoQuery, name: "AutoQuery" },
  { method: Query.standard, name: "Standard Query" },
];

let endpointTypes: Array<EndpointType> = [
  "characters",
  "comics",
  "creators",
  "events",
  "series",
  "stories",
];

let endpoints: Array<Endpoint | EndpointType> = [...endpointTypes];

// Create a list of all possible endpoints (excluding id's)
for (let typeA of endpointTypes) {
  for (let typeB of endpointTypes) {
    if (typeA == typeB) continue;
    const randomCount = Math.floor(Math.random() * 999) + 1;
    endpoints.push([typeA, randomCount, typeB] as Endpoint);
  }
}

describe("MarvelQuery", () => {
  beforeAll(() => {
    // Mock the Marvel API
    const marvelAPI = nock("https://gateway.marvel.com/v1/public");

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
      const query = method("characters", { name: "Peter Parker" });
      const url = query.buildURL();
      expect(url).toContain("/characters");
      expect(url).toContain("apikey=mockPublicKey");
      expect(url).toContain("name=Peter+Parker");
    }
  );

  describe("Testing each unique endpoint type for categories and collections", () => {
    // Test each endpoint type
    endpoints.forEach((endpoint) => {
      // Print the endpoint
      describe(`Querying Endpoint: ${
        Array.isArray(endpoint) ? `${endpoint[0]}/#/${endpoint[2]}` : endpoint
      }`, () => {
        queryModes.forEach(({ method, name }) => {
          describe(name, () => {
            // Create a new instance of MarvelQuery with an Endpoint
            const origin = method(endpoint);
            test("created MarvelQuery instance", () =>
              expect(origin).toBeInstanceOf(MarvelQuery));

            test(`query parameters are valid`, () => {
              expect(origin.validated.parameters).toBe(true);
            });

            // Fetch the query
            let query: MarvelQueryFetched<Endpoint, boolean>;

            test("fetchSingle", async () => {
              const result = await origin.fetchSingle();
              expect(result).toBeDefined();
            });

            test("fetch", async () => {
              query = await origin.fetch();

              expect(query).toBeDefined();
              expect(query.metadata.code).toBe(200);
            });

            test(`API response data is valid`, () => {
              expect(query.validated.results).toBe(true);
            });
          });

          if (name === "AutoQuery") {
            // More tests for AutoQuery only
          }
        });
      });
    });
  });

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
