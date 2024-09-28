import * as fs from "fs";
import * as path from "path";
import nock from "nock";
import {
  EndpointFromType,
  EndpointType,
} from "../src/models/types/endpoint-types";
import {
  ResultMap,
  Params,
} from "../src";

const DATA_DIR = path.join(__dirname, "../tests/data");
const MAX_DATA_LENGTH = 1000; // Example value, replace with actual limit

type SampleData<T extends EndpointType> = ResultMap[T][];

interface DataFile<T extends EndpointType> {
  timestamp: number;
  data: SampleData<T>;
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
  private metadata = {
    code: 200,
    status: "Ok",
    copyright: "© 2024 MOOVEL",
    attributionText:
      "Data not provided by Marvel. This is mock data for testing purposes.",
    attributionHTML:
      '<a href="http://marvel.com">Data provided by Marvel. © 2024 MOOVEL</a>',
    etag: "666Mephisto666",
  };

  private queryCache = Object.fromEntries(
    endpointTypes.map(type => [type, new Map()])
  ) as {
    [T in keyof ResultMap]: Map<string, SampleData<T>>;
  };

  private sampleData: {
    [T in keyof ResultMap]: SampleData<T>;
  } = {
    characters: [],
    comics: [],
    creators: [],
    events: [],
    series: [],
    stories: [],
  }
  private fileMetadata: Map<
    EndpointType,
    { filename: string; timestamp: number }[]
  > = new Map();

  private async loadFileData<T extends EndpointType>(
    type: T,
    data: DataFile<T>
  ) {
    this.sampleData[type].push(...data.data);
  }

  static instance: MockAPI;

  static startServer() {
      if (!MockAPI.instance) {
        MockAPI.instance = new MockAPI();
        // await MockAPI.loadSampleData();
      }
      return MockAPI.instance;
  }

  /**
   * Loads sample data from the data directory and populates the sampleData map.
   * Ensures that the number of data entries for each type does not exceed MAX_DATA_LENGTH.
   */
  async loadSampleData() {
    const files = fs.readdirSync(DATA_DIR);

    files.forEach((file) => {
      const filePath = path.join(DATA_DIR, file);
      this.processFile(filePath, file);
    });
  }

  private processFile(filePath: string, file: string) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const type: EndpointType = file.split("-")[0] as EndpointType;
      const jsonData = JSON.parse(fileContent);

      this.loadFileData(type, jsonData);

      const dataCount = this.sampleData[type].length;

      if (!this.fileMetadata.has(type)) {
        this.fileMetadata.set(type, []);
      }

      const fileMetadataArray = this.fileMetadata.get(type)!;

      fileMetadataArray.push({
        filename: file,
        timestamp: jsonData.timestamp,
      });

      // Check if the combined data array exceeds the maximum length
      if (dataCount > MAX_DATA_LENGTH) {
        // Sort file metadata by timestamp and remove the oldest files
        fileMetadataArray.sort((a, b) => a.timestamp - b.timestamp);
        while (dataCount > MAX_DATA_LENGTH) {
          const oldestFileMetadata = fileMetadataArray.shift();
          if (oldestFileMetadata) {
            const oldestFilePath = path.join(
              DATA_DIR,
              oldestFileMetadata.filename
            );
            fs.unlinkSync(oldestFilePath);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  endAll() {
    // nock.cleanAll();
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

  private getMockResults<D extends keyof ResultMap>(
    type: D,
    parameters: Params<EndpointFromType<D>>,
    pathname: string
  ) {
    let { offset, limit, ...params } = parameters;

    const key = JSON.stringify({ ...params, pathname });
    limit = Number(limit ?? 20);
    offset = Number(offset ?? 0);

    let results: SampleData<D> = [];
    let total: number = 0;

    try {
      // Check if their is a cache for this data type
      if (!this.queryCache) throw new Error(`No query cache found`);

      // Has the query been cached? Meaning the mock data has already been generated.
      if (this.queryCache[type].has(key)) {
        // Retrieve cached results
        results = this.queryCache[type].get(key)! as SampleData<D>;
      } else {
        // Generate mock data of the correct type
        let dataArray = this.shuffle(this.sampleData[type] || []);

        total = Math.min(limit, dataArray.length);

        // Slice the array to the desired length
        results = dataArray.slice(0, total);

        // Cache the results
        this.queryCache[type].set(key, results);
      }
    } catch (error) {
      console.error(`Error getting mock results for key: ${key}`, error);
    }

    return {
      offset,
      limit,
      total,
      count: results.length,
      results: results,
    };
  }

  private shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex] as T, array[randomIndex] as T] = [
        array[randomIndex] as T,
        array[currentIndex] as T,
      ];
      // Note: TypeScript does not like shuffling in this way, so type assertions are used.
      // The following error is produced:
      // error TS2322: Type 'T | undefined' is not assignable to type 'T'.
      // 'T' could be instantiated with an arbitrary type which could be unrelated to 'T | undefined'.
    }

    return array;
  }

  setupMockEndpoint<D extends EndpointType>(
    scope: nock.Scope,
    path: string | RegExp,
    type: D
  ) {
    scope
      .persist()
      .get(path)
      .query(true) // Match any query parameters
      .reply((uri, requestBody, cb) => {
        const url = new URL(uri, "https://gateway.marvel.com");

        const data = this.getMockResults(
          type,
          url.searchParams as Params<EndpointFromType<D>>,
          url.pathname
        );

        cb(null, [
          200,
          {
            ...this.metadata,
            data,
          },
        ]);
      });
  }
}

const API = MockAPI.startServer;
export default API;

