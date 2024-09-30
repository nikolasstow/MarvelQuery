import MarvelQuery, { APIKeys } from "../src";

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
    }
  });

  test("Configuration option: autoQuery = false", async () => {
    const query = MarvelQuery.init(apiKeys, { ...config, autoQuery: false });
    expect(MarvelQuery.config.autoQuery).toBe(false);
  });
});
