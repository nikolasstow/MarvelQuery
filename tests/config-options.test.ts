import superagent from "superagent";
import MarvelQuery, { APIKeys } from "../src";
import exp from "constants";

const apiKeys: APIKeys = {
  publicKey: "mockPublicKey",
  privateKey: "mockPrivateKey",
};

const config = {
  isTestEnv: true,
};

describe("Testing config options", () => {
  test("Configuration option: autoQuery = true", async () => {
    const query = MarvelQuery.init(apiKeys, { ...config, autoQuery: true });

    // Check if the configuration is set
    expect(MarvelQuery.config.autoQuery).toBe(true);

    // Fetch a single character
    const result = await query("characters", {
      name: "Peter Parker",
    }).fetchSingle();
    expect(result).toBeDefined();

    /** AutoQuery Injection adds new properties to the result.
     * Every very occurrence of a “resourceURI” or “collectionURI” property is converted into an Endpoint
     * type tuple, and an “endpoint” property is injected at the same location as the original URI.
     * If you look at the schema of a result item from the API, you will see that they all
     * have a “resourceURI” property, and so now after injection, they will have an “endpoint” property as well.
     * The format of the endpoint property is ["type", id], where type is the type of the resource, and id is the id of the resource.
     */
    expect(result.endpoint).toStrictEqual(["characters", result.id]);

    /** The comics property of the result is a collection, so it should have an endpoint property as well.
     * As a collection of comics that are related to the character, the endpoint should be
     * the same as the character, but with an additional "comics" at the end.
     */
    expect(result.comics.endpoint).toStrictEqual([
      "characters",
      result.id,
      "comics",
    ]);

    // Let's test the query() method that has been injected into the collection
    const comics = await result.comics
      .query({
        /** Note that the query method is missing the first argument, which is usually the endpoint when creating a new
         * MarvelQuery instance, or as you'll see below in querying from a resource, the type of the collection.
         */
        dateRange: ["1976-01-01", "1989-12-31"],
      })
      .fetch(); // fetch() and fetchSingle() are the same as in the main MarvelQuery instance.

    /** In the method above we can query the entire collection and filter it with the parameters we provide.
     * But what if we already have the resource we want from it's collection in the original query?
     */
    const spiderComic = result.comics.items[0];

    if (spiderComic) {
      /** The "items" inside the collections are resources, and if you don't already know resource endpoints
       * always are in the format of ["type", id], and collection endpoints are just the resource endpoint
       * with the collection type appended to the end.
       * For resource items the id is also injected as it is not present in the original data.
       * So before testing the endpoint property, you should check if the id property is present.
       */
      expect(spiderComic.id).toBeDefined();
      // Now we can check the endpoint property
      expect(spiderComic.endpoint).toStrictEqual(["comics", spiderComic.id]);

      /** This process can be repeated and used to validate every new property injected into the data,
       * but that's completely unnecessary because zod already validates the data structure for every query.
       * Instead, it's important that the injected methods work as expected. We'll do a little bit of that here,
       * but the rest of the testing will be done in a separate test file. Here, let's try a few of the methods
       * injected into the resource mentioned above.
       */

      // fetch() and fetchSingle() what's the difference since both are querying a single resource?
      const instance = await spiderComic.fetch();
      // fetch() returns an instance of MarvelQuery which includes the data
      expect(instance).toBeInstanceOf(MarvelQuery);
      // fetchSingle() returns the data directly
      const comic = await spiderComic.fetchSingle();
      expect(comic).toBeDefined();

      /**
       * Now since we have the endpoint from the original resource, it should match the endpoint in the result, right?
       * expect(query.endpoint).toStrictEqual(spiderComic.endpoint); <- This should be true, but it's not.
       * This is the limitation of the Mock API. Unfortunately recreating the real API would be extremely difficult.
       * Instead, the mock API only sends data that matches the expected schema, and not actual data that matches
       * the endpoint and parameters of the query.
       *
       * Man I am writing a lot of comments no one will ever read.
       * Oh well, let's continue testing the methods added to the resource.
       */

      /** The final method added to resources is the query method, similar to the one in the main MarvelQuery instance.
       * The main difference is that you are essentially querying a collection, the first parameter is the type of
       * the collection, and the second is an object with the parameters to filter the collection.
       */
      const trueBeliever = await spiderComic
        .query("creators", {
          // .query() returns a new instance of MarvelQuery
          firstName: "Stan",
        })
        .fetch(); // and Like any other query, fetch() returns the instance and updates it with the data.
      // .fetchSingle() returns just the first result.
      expect(trueBeliever).toBeInstanceOf(MarvelQuery);
    }
  });

  test("Configuration option: autoQuery = false", async () => {
    const query = MarvelQuery.init(apiKeys, { ...config, autoQuery: false });
    expect(MarvelQuery.config.autoQuery).toBe(false);

    // Fetch a single character
    const result = (await query("characters", {
      name: "Peter Parker",
    }).fetchSingle()) as any;
    expect(result).toBeDefined();

    // The result should not have the endpoint property
    expect(result.endpoint).toBeUndefined();
  });

  test("Configuration option: globalParams", async () => {
    const query = MarvelQuery.init(apiKeys, {
      ...config,
      autoQuery: true,
      globalParams: {
        all: { limit: 10 },
        characters: { nameStartsWith: "Spider" },
        comics: { noVariants: true },
      },
    });

    const q1 = await query("characters");
    // query.params should have the global parameters for characters and all
    expect(q1.params).toHaveProperty("limit", 10);
    expect(q1.params).toHaveProperty("nameStartsWith", "Spider");
    expect((q1.params as any).noVariants).toBeUndefined();

    // Verify no more than 10 results are returned
    const result = await q1.fetch();
    expect(result).toBeDefined();
    expect(result.count).toBeGreaterThan(0);
    expect(result.count).toBeLessThanOrEqual(10);
    expect(result.results.length).toBe(result.count);

    // Lets override the global parameters
    const q2 = await query("characters", { nameStartsWith: "Peter" });
    // The global parameters should be overridden by the specific parameters
    expect(q2.params).toHaveProperty("limit", 10);
    expect(q2.params).toHaveProperty("nameStartsWith", "Peter");
  });

  test("Configuration option: onRequest", async () => {
    // Create a mock function to be called when a request is made
    const onRequest = jest.fn();
    const query = MarvelQuery.init(apiKeys, {
      ...config,
      autoQuery: true,
      onRequest,
    });

    await query("characters").fetch();

    // Check that the onRequest callback was called
    expect(onRequest).toHaveBeenCalled();
    // Optionally, check the arguments passed to the onRequest callback
    expect(onRequest).toHaveBeenCalledWith(
      expect.any(String), // url
      ["characters"], // endpoint
      expect.any(Object) // params
    );
  });

  test("Configuration option: httpClient", async () => {
    // Swap the default http client with superagent
    const query = MarvelQuery.init(apiKeys, {
      ...config,
      httpClient: (url: string) => superagent.get(url).then((res) => res.body),
    });

    const result = await query("characters").fetch();
    expect(result.validated.results).toBe(true);
  });

	test("Configuration option: validation - disableAll", async () => {
		const createQuery = MarvelQuery.init(apiKeys, {
			...config,
      autoQuery: true,
			validation: { disableAll: true },
		});

		const query = createQuery("events");
		expect(query.validated.parameters).toBeUndefined();
		
		const result = await query.fetch();
		expect(result.validated.results).toBeUndefined();
		expect(result.validated.autoQuery).toBeUndefined();
	})
});
