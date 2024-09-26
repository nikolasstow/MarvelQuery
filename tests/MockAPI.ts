import * as fs from "fs";
import * as path from "path";
import nock from "nock";
import { Endpoint, EndpointFromType, EndpointType, IsEndpointType } from "../src/models/types/endpoint-types";
import { generateMock } from "@anatine/zod-mock";
import MarvelQuery, {
  APIBaseParams,
  AnyParams,
  APIResponseData,
  ResultMap,
  APIResult,
  APIResponseResults,
  MarvelResult,
	Params,
} from "../src";

const DATA_DIR = path.join(__dirname, "../tests/data");
const MAX_DATA_LENGTH = 1000; // Example value, replace with actual limit

interface SampleData<T extends EndpointType> {
  timestamp: number;
  data: APIResult<EndpointFromType<T>>[];
}

export const endpointTypes: Array<EndpointType> = [
  "characters",
  "comics",
  "creators",
  "events",
  "series",
  "stories",
];

export class MockAPI {
  static metadata = {
    code: 200,
    status: "Ok",
    copyright: "© 2024 MOOVEL",
    attributionText:
      "Data not provided by Marvel. This is mock data for testing purposes.",
    attributionHTML:
      '<a href="http://marvel.com">Data provided by Marvel. © 2024 MOOVEL</a>',
    etag: "666Mephisto666",
  };

  static queryCache = new Map<string, APIResult<Endpoint>[]>();

  static sampleData: {
		[T in keyof ResultMap]: APIResult<EndpointFromType<T>>[];
	}// Map<EndpointType, APIResult<Endpoint>[]> = new Map();
  static fileMetadata: Map<
    EndpointType,
    { filename: string; timestamp: number }[]
  > = new Map();

	static async loadFileData<T extends EndpointType>(type: T, data: SampleData<T>) {
		console.log(`File type: ${type}`);
		if (!MockAPI.sampleData[type]) {
			MockAPI.sampleData[type] = [];
			MockAPI.fileMetadata.set(type, []);
			console.log(`Initialized data and metadata arrays for type: ${type}`);
		}

		MockAPI.sampleData[type].push(...data.data);

		console.log(`Data combined for type: ${type}`);

	}

  /**
   * Loads sample data from the data directory and populates the sampleData map.
   * Ensures that the number of data entries for each type does not exceed MAX_DATA_LENGTH.
   */
  static async loadSampleData() {
    console.log("Reading files from data directory...");
    const files = fs.readdirSync(DATA_DIR);
    console.log(`Found ${files.length} files in data directory.`);

    files.forEach((file) => {
      console.log(`Processing file: ${file}`);
      const filePath = path.join(DATA_DIR, file);
      console.log(`File path: ${filePath}`);

      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        console.log(`File content read successfully.`);
				const type: EndpointType = file.split("-")[0] as EndpointType;
				const jsonData = JSON.parse(fileContent);
				
				MockAPI.loadFileData(type, jsonData);
        // const jsonData: SampleData<typeof type> = JSON.parse(fileContent);
        // console.log(`File content parsed successfully.`);

        
        // console.log(`File type: ${type}`);
        // if (!MockAPI.sampleData[type]) {
        //   MockAPI.sampleData[type] = [];
        //   MockAPI.fileMetadata.set(type, []);
        //   console.log(`Initialized data and metadata arrays for type: ${type}`);
        // }

        const dataArray = MockAPI.sampleData[type];
        const fileMetadataArray = MockAPI.fileMetadata.get(type)!;

        // Combine data
        // MockAPI.sampleData[type].push(...jsonData.data);
        fileMetadataArray.push({
          filename: file,
          timestamp: jsonData.timestamp,
        });
        console.log(`Data combined for type: ${type}`);

        // Check if the combined data array exceeds the maximum length
        if (dataArray.length > MAX_DATA_LENGTH) {
          console.log(
            `Data array for type ${type} exceeds maximum length. Removing oldest files...`
          );
          // Sort file metadata by timestamp and remove the oldest files
          fileMetadataArray.sort((a, b) => a.timestamp - b.timestamp);
          while (dataArray.length > MAX_DATA_LENGTH) {
            const oldestFileMetadata = fileMetadataArray.shift();
            if (oldestFileMetadata) {
              const oldestFilePath = path.join(
                DATA_DIR,
                oldestFileMetadata.filename
              );
              fs.unlinkSync(oldestFilePath);
              console.log(
                `Deleted oldest file: ${oldestFileMetadata.filename}`
              );
            }
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    });
    console.log("Finished loading sample data.");
  }

  static endAll() {
    nock.cleanAll();
  }

  constructor() {
    const marvelAPI = nock("https://gateway.marvel.com/v1/public");

    // Setup mock endpoints for all possible endpoints with mock data of the correct type
    for (let type of endpointTypes) {
      // Mock Collection Endpoints
      for (let sourceType of endpointTypes) {
        this.setupMockEndpoint(
          marvelAPI,
          new RegExp(`/${sourceType}/.*?/${type}`),
          type
        );
      }
      // Mock Category Endpoints
      this.setupMockEndpoint(marvelAPI, `/${type}`, type);
      // Mock Resource Endpoints
      this.setupMockEndpoint(marvelAPI, new RegExp(`/${type}/\\d+$`), type);
    }
  }

  private getMockResults<T extends keyof ResultMap,>(
    type: T,
    parameters: Params<EndpointFromType<T>>,
    pathname: string
  ) {
    let { offset, limit, ...params } = parameters;

    const key = JSON.stringify({ ...params, pathname });
    limit = Number(limit ?? 20);
    offset = Number(offset ?? 0);

    let results: APIResult<EndpointFromType<T>>[] = [];
    let total: number = 0;

    // Has the query been cached? Meaning the mock data has already been generated.
    if (MockAPI.queryCache.has(key)) {
      // Retrieve cached results
      results = MockAPI.queryCache.get(key) as APIResult<EndpointFromType<T>>[];
      console.log(`Retrieved cached results for key: ${key}`);
    } else {
      // Generate mock data of the correct type
      let dataArray = MockAPI.sampleData[type] || [] as APIResult<EndpointFromType<T>>[];
      console.log(`Data array length before filtering: ${dataArray.length}`);

      // Fisher-Yates shuffle algorithm
      // for (let i = dataArray.length - 1; i > 0; i--) {
      //   const j = Math.floor(Math.random() * (i + 1));
      //   [dataArray[i], dataArray[j]] = [
      //     dataArray[j],
      //     dataArray[i],
      //   ];
      // }
      console.log(`Data array shuffled`);


      total = Math.min(limit, dataArray.length);
      console.log(`Total items to return: ${total}`);

      // Slice the array to the desired length
      results = dataArray.slice(0, total);
      console.log(`Results array length: ${results.length}`);

      // Cache the results
      // MockAPI.queryCache.set(key, results);
      console.log(`Cached results for key: ${key}`);
    }

    return {
      offset,
      limit,
      total,
      count: results.length,
      results,
    };
  }

  setupMockEndpoint(
    scope: nock.Scope,
    path: string | RegExp,
    type: EndpointType
  ) {
    scope
      .persist()
      .get(path)
      .query(true) // Match any query parameters
      .reply((uri, requestBody, cb) => {
        const url = new URL(uri, "https://gateway.marvel.com");

        // Extract parameters excluding offset and limit
        // let { offset, limit, ...params } = url.searchParams as APIBaseParams &
        //   AnyParams;

        // // Generate a key for the query cache
        // const key = JSON.stringify({ ...params, pathname: url.pathname });

        // let total: number = 0;

        // // Check if the query (minus offset and limit) has been cached. This ensure the total count is consistent.
        // if (MockAPI.queryCache.has(key)) {
        //   total = MockAPI.queryCache.get(key)!;
        // } else {
        //   total = Math.floor(Math.random() * 100) + 1; // Random count between 1 and 100
        //   MockAPI.queryCache.set(key, total);
        // }

        // limit = Number(url.searchParams.get("limit") || 20);
        // offset = Number(url.searchParams.get("offset") || 0);

        // // Count is the limit or the total, whichever is smaller
        // const count = Math.min(limit, total);

        // const response: APIResponseData = {
        //   offset,
        //   limit,
        //   total,
        //   count,
        // };

        // const results = [];

        const data = this.getMockResults(
          type,
          url.searchParams as APIBaseParams & AnyParams,
          url.pathname
        );

        cb(null, [
          200,
          {
            ...MockAPI.metadata,
            data,
          },
        ]);
      });
  }

  // private getRandomItems<T>(array: T[], num: number): T[] {
  //   if (num >= array.length) {
  //     return array;
  //   }

  //   const shuffledArray = array.slice();
  //   for (let i = shuffledArray.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [shuffledArray[i], shuffledArray[j]] = [
  //       shuffledArray[j],
  //       shuffledArray[i],
  //     ];
  //   }

  //   return shuffledArray.slice(0, num);
  // }
}
