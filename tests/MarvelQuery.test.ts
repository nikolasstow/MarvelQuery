import { generateMock } from "@anatine/zod-mock";
import nock from "nock";

import MarvelQuery, {
  Config,
  Endpoint,
  EndpointType,
} from "../src";

import { endpointTypes, MockAPI } from "./MockAPI";

const mockKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

const config: Partial<Config<boolean>> = {
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

const queryModes = [
  { method: createAutoQuery, name: "AutoQuery" },
  { method: createStandardQuery, name: "Standard Query" },
];

let endpoints: Array<Endpoint | EndpointType> = [...endpointTypes];

// Create a list of all possible endpoints (excluding id's)
for (let typeA of endpointTypes) {
  const randomCount = Math.floor(Math.random() * 999) + 1;
  endpoints.push([typeA, randomCount] as Endpoint);
  for (let typeB of endpointTypes) {
    if (typeA == typeB) continue;
    endpoints.push([typeA, randomCount, typeB] as Endpoint);
  }
}

describe("MarvelQuery", () => {
  beforeAll(async () => {
    console.log("Starting to load sample data...");
    await MockAPI.loadSampleData();
    console.log("Sample data loaded.");
    new MockAPI();
    console.log("MockAPI instance created.");
  });

  afterAll(() => {
    MockAPI.endAll();
  });

  // Create a new instance of MarvelQuery with an EndpointType
  test.each(queryModes)(
    "should create an instance with an EndpointType ($name)",
    ({ method }) => {
      const query = method("characters", { name: "Peter Parker" });
      expect(query).toBeInstanceOf(MarvelQuery);
    }
  );

  // // Create a new instance of MarvelQuery with an Endpoint
  // test.each(queryModes)(
  //   "should create an instance with an Endpoint ($name)",
  //   ({ method }) => {
  //     const query = method(["characters"], { name: "Peter Parker" });
  //     expect(query).toBeInstanceOf(MarvelQuery);
  //   }
  // );

  // // Build a valid URL
  // test.each(queryModes)(
  //   "should build a valid URL with endpoint, API keys, and parameters ($name)",
  //   ({ method }) => {
  //     const query = method("characters", { name: "Peter Parker" });
  //     const url = query.buildURL();
  //     expect(url).toContain("/characters");
  //     expect(url).toContain("apikey=mockPublicKey");
  //     expect(url).toContain("name=Peter+Parker");
  //   }
  // );

  // describe("Testing each unique endpoint type", () => {
  //   // Test each endpoint type
  //   endpoints.forEach((endpoint) => {
  //     // Print the endpoint
  //     describe(`Querying Endpoint: ${
  //       Array.isArray(endpoint) ? `${endpoint[0]}/#/${endpoint[2]}` : endpoint
  //     }`, () => {
  //       queryModes.forEach(({ method, name }) => {
  //         describe(name, () => {
  //           // Create a new instance of MarvelQuery with an Endpoint
  //           let origin = method(endpoint);
  //           test("created MarvelQuery instance", () =>
  //             expect(origin).toBeInstanceOf(MarvelQuery));

  //           test(`query parameters are valid`, () => {
  //             expect(origin.validated.parameters).toBe(true);
  //           });

  //           // Fetch the query
  //           let query: MarvelQueryFetched<Endpoint, boolean>;

  //           test("fetchSingle", async () => {
  //             const result = await origin.fetchSingle();
  //             expect(result).toBeDefined();
  //           });

  //           test("fetch", async () => {
  //             query = await origin.fetch();

  //             expect(query).toBeDefined();
  //             expect(query.metadata.code).toBe(200);
  //           });

  //           // test(`API response data is valid`, () => {
  //           //   expect(query.validated.results).toBe(true);
  //           // });

  //           if (name === "AutoQuery") {
  //             const autoQuery = MarvelQuery.init(mockKeys, {
  //               ...config,
  //               autoQuery: true,
  //             })(endpoint); // Easier to just create a new instance
  //             // More tests for AutoQuery only
  //             let query: MarvelQueryFetched<Endpoint, true>;
  //             beforeAll(async () => {
  //               query = await autoQuery.fetch();
  //             });

  //             test("autoQuery is enabled", () => {
  //               expect(query.autoQuery).toBe(true);
  //             });

  //             test("AutoQueries have been injected", async () => {
  //               const result = await query.results[0];
  //               if (result) {
  //                 const secondary = await result.fetch();
  //                 // Is it an instance of MarvelQuery?
  //                 expect(secondary).toBeInstanceOf(MarvelQuery);
  //               }
  //             });
  //           }
  //         });
  //       });
  //     });
  //   });
  // });
  
  // describe("Testing for specific data types, with AutoQuery enabled", () => {
  //   const createQuery = MarvelQuery.init(mockKeys, {
  //     ...config,
  //     autoQuery: true,
  //   })
  //   test("Searching for Comics", async () => {
  //     const query = createQuery(["comics"], { titleStartsWith: "Spider" });
  //     const result = (await query.fetch()).results[0];
  //     // result.characters.
  //   })
  // })
});
