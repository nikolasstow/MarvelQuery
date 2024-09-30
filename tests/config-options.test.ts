import MarvelQuery, { APIKeys } from "../src";

const apiKeys: APIKeys = {
	publicKey: "mockPublicKey",
	privateKey: "mockPrivateKey",
}

const config = {
	isTestEnv: true,
}

describe("Testing config options", () => {
	test("Configuration option: autoQuery = true", async () => {
		const query = MarvelQuery.init(apiKeys, { ...config, autoQuery: true });
		expect(MarvelQuery.config.autoQuery).toBe(true);

		const result = await query("characters", { name: "Peter Parker" }).fetchSingle();
		expect(result).toBeDefined();
;
		const ppEndpoint = result.endpoint
		expect(ppEndpoint).toStrictEqual(["characters", result.id]);

		const comicsEndpoint = result.comics.endpoint;
		expect(comicsEndpoint).toBeDefined();
		
	});

	test("Configuration option: autoQuery = false", async () => {
		const query = MarvelQuery.init(apiKeys, { ...config, autoQuery: false });
		expect(MarvelQuery.config.autoQuery).toBe(false);
	});
});