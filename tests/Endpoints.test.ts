import MarvelQuery, { Endpoint, EndpointType } from "../src";
import { MarvelQueryFetched } from "../src/models/types/interface";
import { endpointTypes, MockAPI } from "./MockAPI";
import { queryModes, mockKeys, config } from "./MarvelQuery.test";

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

let mock: MockAPI;

describe("Testing each unique endpoint type", () => {

	beforeAll(async () => {
    mock = await MockAPI.startServer();
  });

  afterAll(() => {
    mock.endAll();
  });

	// Test each endpoint type
	endpoints.forEach((endpoint) => {
		// Print the endpoint
		describe(`Querying Endpoint: ${
			Array.isArray(endpoint) ? `${endpoint[0]}/#/${endpoint[2]}` : endpoint
		}`, () => {
			queryModes.forEach(({ method, name }) => {
				test(name, async () => {
					// Create a new instance of MarvelQuery with an Endpoint
					let origin = method(endpoint);

					expect(origin).toBeInstanceOf(MarvelQuery);
					expect(origin.validated.parameters).toBe(true);

					// Fetch the query
					let query: MarvelQueryFetched<Endpoint, boolean>;

					const result = await origin.fetchSingle();
					expect(result).toBeDefined();

					query = await origin.fetch();

					expect(query).toBeDefined();
					expect(query.metadata.code).toBe(200);

					if (name === "AutoQuery") {
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
						}
					}
				});
			});
		});
	});
});