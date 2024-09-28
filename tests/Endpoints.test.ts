import MarvelQuery, { Endpoint, EndpointType, TYPES } from "../src";
import { MarvelQueryFetched } from "../src/models/types/interface";
import { queryModes, mockKeys, config } from "./MarvelQuery.test";

let endpoints: Array<Endpoint | EndpointType> = [...TYPES];

// Create a list of all possible endpoints (excluding id's)
for (let typeA of TYPES) {
  const randomCount = Math.floor(Math.random() * 999) + 1;
  endpoints.push([typeA, randomCount] as Endpoint);
  for (let typeB of TYPES) {
    if (typeA == typeB) continue;
    endpoints.push([typeA, randomCount, typeB] as Endpoint);
  }
}

describe("Testing each unique endpoint type", () => {
  // Test each endpoint type
  endpoints.forEach((endpoint) => {
    const endpointString = Array.isArray(endpoint)
      ? `${endpoint[0]}/#/${endpoint[2]}`
      : endpoint;
    describe(`Querying Endpoint: ${endpointString}`, () => {
      queryModes.forEach(({ method, name }) => {
        test(name, async () => {
          // Pick a random number for the query limit
          const limit = Math.floor(Math.random() * 100) + 1;

          // Create a new instance of MarvelQuery with an Endpoint
          const origin = method(endpoint, { limit });

          // Verify it's an instance of MarvelQuery
          expect(origin).toBeInstanceOf(MarvelQuery);
          // Are parameters valid?
          expect(origin.validated.parameters).toBe(true);

          // Fetch a single result (changes limit to 1, and offset to 0)
          const result = await origin.fetchSingle(); // Returns result object
          expect(result).toBeDefined();

          // Queries the api at the given endpoint with the set parameters
          const query = await origin.fetch(); // Returns instance of MarvelQuery, now with results

          // Verify it's a MarvelQuery instance
          expect(query).toBeInstanceOf(MarvelQuery);
          // If the query was recieved, the API should reply with code 200
          expect(query.metadata.code).toBe(200);

          // Did we get the expected amount of results?
          // const expectedCount = query.total // > limit ? limit : query.total;
          // const apiResponseCount = query.count;
          // const actualCount = query.results.length;

          // expect(actualCount).toEqual(expectedCount);
          // expect(actualCount).toEqual(apiResponseCount);
        });
      });
      test(`AutoQuery Injection for ${endpointString}`, async () => {
        const autoQuery = MarvelQuery.init(mockKeys, {
          ...config,
          autoQuery: true,
        })(endpoint); // Easier to just create a new instance
        // More tests for AutoQuery only
        let query = await autoQuery.fetch();

        expect(query.autoQuery).toBe(true);
        const result = await query.results[0];
        if (result) {
          const secondary = await result.fetch();
          // Is it an instance of MarvelQuery?
          expect(secondary).toBeInstanceOf(MarvelQuery);
        } else {
          throw new Error("AQ Injection test failed due to missing data");
        }
      });
    });
  });
});
