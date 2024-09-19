import MarvelQuery, { CreateQueryFunction } from "../src";
import { CharactersSchema } from "../src/models/schemas/param-schemas";

describe("MarvelQuery", () => {
  let createQuery: CreateQueryFunction;

  beforeAll(() => {
    // Initialize MarvelQuery with mock keys and get the createQuery function
    createQuery = MarvelQuery.init({
      publicKey: "mockPublicKey",
      privateKey: "mockPrivateKey",
    });
  });

  // Create a new instance of MarvelQuery with an EndpointType
  it("should create an instance with API key and secret", () => {
    const query = createQuery("characters", { name: "Peter Parker" });
    expect(query).toBeInstanceOf(MarvelQuery);
  });

  // Create a new instance of MarvelQuery with an Endpoint
  it("should create an instance with API key and secret", () => {
    const query = createQuery(["characters"], { name: "Peter Parker" });
    expect(query).toBeInstanceOf(MarvelQuery);
  });

  // Build a valid URL
  it("should build a valid URL", () => {
    const query = createQuery("characters", { name: "Peter Parker" });
    const url = query.buildURL();
    expect(url).toContain("/characters");
    expect(url).toContain("apikey=mockPublicKey");
    expect(url).toContain("name=Peter+Parker");
  });

  it("should return characters named Peter Parker", async () => {
    const query = createQuery("characters", { name: "Peter Parker" });
    const url = query.buildURL();
    const result = await query.request(url);

    result.data.results.forEach((character) => {
      // Validate using zod schema
      const validationResult = CharactersSchema.safeParse(character); // Wont work because result is already extended
      // Check if the validation passed
      expect(validationResult.success).toBe(true);
    });
  });

  it("should return a single character named Peter Parker", async () => {
    const result = await createQuery("characters", {
      name: "Peter Parker",
    }).fetchSingle();
    // Validate using zod schema
    const validationResult = CharactersSchema.safeParse(result); // Wont work because result is already extended
    // Check if the validation passed
    expect(validationResult.success).toBe(true);
  });

  // Add more tests for other methods and functionalities
});
