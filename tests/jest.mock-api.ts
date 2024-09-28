import * as fs from "fs";
import * as path from "path";
import nock from "nock";
import { EndpointType, Params, ResultMap, TYPES } from "../src";
import { EndpointFromType } from "../src/models/types/endpoint-types";

type SampleData<T extends EndpointType> = ResultMap[T][];

type DataFile<T extends EndpointType> = {
  timestamp: number;
  data: SampleData<T>;
};

type Cache = {
  [T in keyof ResultMap]: Map<string, SampleData<T>>;
};

type SampleDataMap = {
  [T in keyof ResultMap]: SampleData<T>;
};

type FileMap = Map<EndpointType, { filename: string; timestamp: number }[]>;

const DATA_DIR = path.join(__dirname, "../tests/data");
const MAX_DATA_LENGTH = 1000; // Example value, replace with actual limit

const metadata = {
  code: 200,
  status: "Ok",
  copyright: "© 2024 MOOVEL",
  attributionText:
    "Data not provided by Marvel. This is mock data for testing purposes.",
  attributionHTML:
    '<a href="http://marvel.com">Data provided by Marvel. © 2024 MOOVEL</a>',
  etag: "666Mephisto666",
};

let queryCache: Cache = {} as Cache;

let sampleData: SampleDataMap = {} as SampleDataMap;

const files: FileMap = new Map();

async function loadSampleData() {
  const files = fs.readdirSync(DATA_DIR);

  files.forEach((file) => {
    const filePath = path.join(DATA_DIR, file);
    processFile(filePath, file);
  });
}

function processFile(filePath: string, file: string) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const type: EndpointType = file.split("-")[0] as EndpointType;
    const jsonData = JSON.parse(fileContent);

    loadFileData(type, jsonData);

    const dataCount = sampleData[type].length;

    // Get the data files for the type
    const dataFiles = files.get(type) || [];
    // Add the new file to the list
    dataFiles.push({
      filename: file,
      timestamp: jsonData.timestamp,
    });

    // Check if the data count exceeds the limit
    if (dataCount > MAX_DATA_LENGTH) {
      // Sort the files by timestamp
      dataFiles.sort((a, b) => a.timestamp - b.timestamp);

      // Remove the oldest file
      const oldest = dataFiles.shift();
      if (oldest) {
        const oldestFile = path.join(DATA_DIR, oldest.filename);
        fs.unlinkSync(oldestFile);
      }
      // Update the files map
      files.set(type, dataFiles);
    }
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
  }
}

async function loadFileData<T extends EndpointType>(
  type: T,
  data: DataFile<T>
) {
  if (!sampleData[type] || !Array.isArray(sampleData[type])) {
    sampleData[type] = [];
  }
  sampleData[type].push(...data.data);
}

function getMockResults<D extends keyof ResultMap>(
  type: D,
  parameters: Params<EndpointFromType<D>>,
  pathname: string
) {
  let { offset, limit, ...params } = parameters;

  const key = JSON.stringify({ ...params, pathname });
  if (!limit || !offset) {
    throw new Error(`Limit and offset are required parameters: ${parameters}`);
  }
  limit = Number(limit ?? 20);
  offset = Number(offset ?? 0);

  let results: SampleData<D> = [];
  let total: number = 0;

  try {
    // Check if their is a cache for this data type
    if (!queryCache) throw new Error(`No query cache found`);

    if (!queryCache[type]) {
      queryCache[type] = new Map();
    }

    // Has the query been cached? Meaning the mock data has already been generated.
    if (queryCache[type].has(key)) {
      // Retrieve cached results
      results = queryCache[type].get(key)! as SampleData<D>;
      total = results.length;
    } else {
      // Generate mock data of the correct type
      let dataArray = shuffle(sampleData[type] || []);

      total = Math.min(limit, dataArray.length);

      // Slice the array to the desired length
      results = dataArray.slice(0, total);

      // Cache the results
      queryCache[type].set(key, results);
    }
  } catch (error) {
    console.error(`Error getting mock results for key: ${key}`, error);
  }

  results = results.slice(offset, offset + limit);

  const count = results.length;

  const response = {
    offset,
    limit,
    total,
    count,
    results,
  }

  if (count < 1) console.log(response);

  return response;
}

function shuffle<T>(array: T[]): T[] {
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

function setupMockEndpoint<D extends EndpointType>(
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

      const data = getMockResults(
        type,
        Object.fromEntries(url.searchParams.entries()),
        url.pathname
      );

      cb(null, [
        200,
        {
          ...metadata,
          data,
        },
      ]);
    });
}

async function startMockAPI() {
  // Load sample data from files
  await loadSampleData();

  const marvelAPI = nock("https://gateway.marvel.com/v1/public");

  for (let type of TYPES) {
    for (let sourceType of TYPES) {
      setupMockEndpoint(
        marvelAPI,
        new RegExp(`/${sourceType}/.*?/${type}`),
        type
      );
    }

    // Mock Category Endpoints
    setupMockEndpoint(marvelAPI, `/${type}`, type);
    // Mock Resource Endpoints
    setupMockEndpoint(marvelAPI, new RegExp(`/${type}/\\d+$`), type);
  }
}

startMockAPI();
