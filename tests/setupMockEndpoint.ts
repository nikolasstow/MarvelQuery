import { generateMock } from "@anatine/zod-mock";
import nock from "nock";
import { z } from "zod";
import { APIBaseParams, AnyParams, APIResponseData } from "../src";

const queryCache = new Map<string, number>();

let metadata = {
	code: 200,
	status: "Ok",
	copyright: "© 2024 MOOVEL",
	attributionText: "Data not provided by Marvel. This is mock data for testing purposes.",
	attributionHTML: "<a href=\"http://marvel.com\">Data provided by Marvel. © 2024 MOOVEL</a>",
	etag: "666Mephisto666",
}

export function setupMockEndpoint(scope: nock.Scope,
	path: string | RegExp,
	schema: z.ZodType) {
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

			const results = Array.from({ length: limit }, () => generateMock(schema)
			);

			cb(null, [
				200,
				{
					...metadata,
					data: {
						...response,
						results,
					},
				},
			]);
		});
}

