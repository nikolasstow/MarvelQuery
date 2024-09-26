import axios from "axios";
import * as CryptoJS from "crypto-js";
import logger, { CustomLogger } from "./utils/Logger";
import { AutoQuery } from "./utils/AutoQuery";
import { EndpointBuilder } from "./utils/EndpointBuilder";
import { ParameterManager } from "./utils/ParameterManager";
import { ResultValidator } from "./utils/ResultValidator";
import { Config } from "./models/types/config-types";
import { Params } from "./models/types/param-types";
import {
  ExtendResult,
  InitQuery,
  Result,
} from "./models/types/autoquery-types";
import {
  APIKeys,
  CreateQueryFunction,
  OnResultFunction,
  AnyResultFunction,
} from "./models/types/config-types";
import {
  ResultMap,
  Metadata,
  APIResponseData,
  APIWrapper,
  APIResult,
} from "./models/types/data-types";
import {
  Endpoint,
  EndpointType,
  EndpointDescriptor,
  AsEndpoint,
} from "./models/types/endpoint-types";
import { MarvelQueryFetched, MarvelQueryInit } from "./models/types/interface";

/**
 * The MarvelQuery class is responsible for handling requests to the Marvel API.
 * It manages the process of constructing queries, sending requests, processing results,
 * and extending the results with additional functionality.
 *
 * @template E The endpoint type, extending the base Endpoint type.
 */
export class MarvelQuery<E extends Endpoint, A extends boolean>
  implements MarvelQueryInit<E, A>
{
  /** ********* Static Properties ********* */
  /** Stores the API keys used for authentication with the Marvel API */
  private static apiKeys: APIKeys;
  /**
   * Configuration settings for the MarvelQuery class.
   * These include global parameters, verbosity, HTTP client, and more.
   * The default configuration can be overridden when initializing the class.
   */
  private static config: Config<boolean>;

  /**
   * Creates a new instance of the MarvelQuery class.
   *
   * @template T The type of the endpoint or endpoint type.
   * @param endpoint The endpoint to query.
   * @param params Optional parameters for the query.
   * @returns A new instance of MarvelQueryInterface for the specified endpoint.
   */
  private static createQuery = <
    T extends Endpoint | EndpointType,
    A extends boolean
  >(
    endpoint: T,
    params: Params<AsEndpoint<T>> = {}
  ): MarvelQuery<AsEndpoint<T>, A> =>
    new MarvelQuery<AsEndpoint<T>, A>({
      endpoint: (Array.isArray(endpoint)
        ? endpoint
        : [endpoint]) as AsEndpoint<T>,
      params,
    });

  /**
   * Initializes the MarvelQuery class with API keys and configuration settings.
   *
   * @param apiKeys The API keys for authentication.
   * @param config Optional configuration overrides.
   * @returns The createQuery function for creating new query instances.
   */
  static init<A extends boolean = true>(
    apiKeys: APIKeys,
    config: Partial<Config<A>> = {}
  ): CreateQueryFunction<A> {
    // Set verbose logging based on the configuration
    logger.setConfig(config);
    logger.verbose("Initializing MarvelQuery. Setting up global config...");

    const defaultConfig: Config<true> = {
      autoQuery: true,
      globalParams: {},
      omitUndefined: true,
      logOptions: {
        verbose: false,
      },
      // All validation is enabled by default
      validation: {
        disableAll: false,
        parameters: true,
        apiResponse: true,
        autoQuery: true,
      },
      httpClient: (url) => axios.get(url).then((response) => response.data),
    };

    // Assign API keys and merge the provided config with the default config
    MarvelQuery.apiKeys = apiKeys;
    MarvelQuery.config = { ...defaultConfig, ...config };

    // Set config as static property on ParameterManager class
    ParameterManager.setConfig(config);

    return MarvelQuery.createQuery;
  }

  /** ********* Instance Properties ********* */
  /** Query identifier for logging */
  queryId: string;
  /** AutoQuery Injection */
  autoQuery: boolean;
  /** Modified logger instance with query identifier */
  private logger: CustomLogger;
  /**
   * A function to be called when the query is finished.
   * This can be specific to the endpoint type or a general function.
   */
  private onResult?:
    | OnResultFunction<ResultMap[EndpointType]>
    | AnyResultFunction;

  validated = {
    parameters: false,
    results: false,
    autoQuery: false,
  };
  /**
   * Endpoint path as a tuple, and the type of the endpoint
   * @example http://gateway.marvel.com/v1/public/characters/1009491/comics
   * becomes { path: ["characters", "1009491", "comics"], type: "comics" }
   *  */
  endpoint: EndpointDescriptor<E>;
  /** Parameters of the query */
  params: Params<E>;
  /** The URL of the query */
  url: string;

  // Properties for the fetched results (will be hidden pre-fetch)
  /** The number of results returned by the query. */
  count: number = 0;
  /** The total number of results available for the query. */
  total: number = 0;
  /** Metadata included in the API response. */
  metadata: Metadata;
  /** Data for the API response. */
  responseData: APIResponseData;
  /** The results of the query. */
  results: Result<E, typeof MarvelQuery.config.autoQuery>[];
  /** A history of all results returned by this query instance.. */
  resultHistory: Result<E, typeof MarvelQuery.config.autoQuery>[] = [];
  /** The query is complete when all results have been fetched. */
  isComplete: boolean = false;

  /**
   * Constructs a new instance of the MarvelQuery class.
   * Validates the endpoint and parameters, and inserts default parameters if not provided.
   *
   * @param initQuery An object containing the endpoint and parameters for the query.
   */
  constructor({ endpoint, params }: InitQuery<E>) {
    // Create a unique identifier for the query
    this.queryId = this.createUniqueId();
    // Create a modified logger instance with the query identifier
    this.logger = logger.identify(this.queryId);

    this.logger.verbose(
      `Created new query for endpoint: ${endpoint.join("/")}`,
      params
    );

    // Setup and Validate the endpoint and parameters
    this.endpoint = new EndpointBuilder(endpoint, this.logger);

    this.autoQuery = MarvelQuery.config.autoQuery;

    const paramManager = new ParameterManager(this.logger);

    this.params = paramManager.query(
      this.endpoint,
      params
    );

    this.validated.parameters = paramManager.isValid;

    // Set the onResult function for the specific type, or the 'any' type if not provided.
    if (MarvelQuery.config.onResult) {
      this.logger.verbose(
        `Setting onResult function for ${this.endpoint.type}`
      );
      const typeSpecificOnResult =
        MarvelQuery.config.onResult[this.endpoint.type];
      this.onResult = typeSpecificOnResult
        ? typeSpecificOnResult
        : MarvelQuery.config.onResult.any;
    }
  }

  /**
   * Creates a unique identifier for the query.
   *
   * @returns The unique identifier for the query.
   */
  private createUniqueId(): string {
    // Use current time (in milliseconds) to generate a unique ID
    const now = Date.now(); // Current timestamp in milliseconds

    // Optionally, we can further modify the timestamp to create shorter or more human-readable IDs
    const uniqueId = (now % 10000).toString(); // Take the last 4 digits for brevity

    return uniqueId;
  }

  /**
   * Fetches the results for the query, processes them, and calls the onResult function.
   *
   * @returns A promise that resolves to the MarvelQuery instance.
   */
  async fetch(): Promise<MarvelQueryFetched<E, A>> {
    // Build the URL for the API request using the endpoint and parameters
    this.url = this.buildURL();
    // Send the request and await the response
    const response = await this.request(this.url);
    // Process the response, and extend the results with the additional properties
    const processedResults = this.processResults(response);
    // Call the onResult function if it is defined
    this.callOnResult(processedResults);

    // Return the MarvelQuery instance for method chaining
    return this as MarvelQueryFetched<E, A>;
  }

  /**
   * Builds the URL for the query using the api keys, the endpoint and parameters.
   *
   * @returns The URL for the query.
   */
  public buildURL(): string {
    const endpoint = this.endpoint.path;
    const params: Record<string, unknown> = this.params;

    this.logger.verbose(
      `Building URL for ${endpoint.join("/")} with parameters:`,
      params
    );

    // Set the base URL and endpoint path for the query
    const baseURL = "https://gateway.marvel.com/v1/public";
    const endpointPath = endpoint.join("/");
    const timestamp = Number(new Date());

    // Destructure the API keys for public and private keys
    const { privateKey, publicKey } = MarvelQuery.apiKeys;

    // Create an MD5 hash with the timestamp, private key and public key
    const hash = privateKey
      ? CryptoJS.MD5(timestamp + privateKey + publicKey).toString()
      : "";

    this.logger.verbose(`Generated hash: ${hash}`);

    // Build the URL of the query with the parameters, keys, timestamp and hash.
    const queryParams = new URLSearchParams({
      apikey: publicKey,
      ts: timestamp.toString(),
      hash,
      ...params,
    });

    // Combine the base URL and endpoint path with the query parameters
    const finalURL = `${baseURL}/${endpointPath}?${queryParams.toString()}`;

    this.logger.verbose(`Built URL: ${finalURL}`);

    return finalURL;
  }

  /**
   * Processes the results returned by the API, extending them with additional properties.
   *
   * @param response The API response containing the results to process.
   * @returns An array of extended results.
   */
  private processResults(response: APIWrapper<APIResult<E>>): Result<E, A>[] {
    // Destructure the response to extract data and metadata
    const { data, ...metadata } = response;
    const { results, ...responseData } = data;
    const { total, count, offset } = responseData;

    // Calculate the number of results fetched and the remaining results
    const fetched = offset + count;
    const remaining = total - fetched;

    // Update the instance count and adjust the offset parameter for the next request
    this.count = fetched;
    this.params.offset = fetched;

    this.logger.verbose(
      `Fetched ${count} results. Total fetched: ${fetched}/${total}. Remaining: ${remaining}.`
    );

    // Check if no results were returned
    const noResults = this.verify(!results.length, () =>
      this.logger.warn("No results found")
    );

    // Check if all results have been fetched for this query
    const complete = this.verify(remaining <= 0, () =>
      this.logger.verbose("No more results found")
    );

    // Check for duplicate results by comparing IDs with the previous results
    const duplicateResults =
      this.resultHistory.length > 0
        ? this.verify(
            results.map((result) => result.id) ===
              this.results.map((result) => result.id),
            () => this.logger.warn("Duplicate results found") // Add more context
          )
        : false;

    let returnData = results as Result<E, A>[];

    if (this.autoQuery) {
      /**
       * Create an instance of the AutoQuery class, passing the MarvelQuery class with the query endpoint.
       * Results are passed to the inject() method where they are processed and injected with properties
       * and a query method that returns an instance of the MarvelQuery class passed in the constructor.
       */
      const autoQuery = new AutoQuery<E>(
        MarvelQuery,
        this.endpoint,
        this.logger,
        MarvelQuery.config
      );
      returnData = autoQuery.inject(results) as Result<E, A>[];
    }

    // Update the MarvelQuery instance properties
    this.isComplete = complete || duplicateResults || noResults;
    this.metadata = metadata;
    this.responseData = responseData;
    this.results = returnData;
    this.resultHistory = [...this.resultHistory, ...returnData];

    this.logger.verbose(
      "Results processed " +
        (this.autoQuery
          ? "and extended with AutoQuery Injection."
          : "sucessfully.")
    );
    return returnData;
  }

  /**
   * If logic is true, executes the action function.
   * @param logic Boolean to check.
   * @param action Method to execute if logic is true.
   * @returns The value of logic.
   */
  private verify(logic: boolean, action: () => void): boolean {
    if (logic) {
      action();
    }
    return logic;
  }

  /**
   * Calls the onResult function with the processed results, if it is defined.
   *
   * @param results The processed results to pass to the onResult function.
   */
  private callOnResult(
    results: Result<E, typeof MarvelQuery.config.autoQuery>[]
  ): void {
    // Call the onResult function if it is defined
    if (this.onResult) {
      this.logger.verbose(
        "Calling onResult function with the processed results."
      );
      this.onResult(results);
    }
  }

  /**
   * Sends the request to the API and validates the response.
   *
   * @param url The URL to send the request to.
   * @returns A promise that resolves to the API response wrapped in an APIWrapper.
   */
  async request(url: string): Promise<APIWrapper<APIResult<E>>> {
    // Create a timer for the request to measure performance
    const timer = logger.performance(
      `Sending request to endpoint: ${this.endpoint.path.join("/")}`,
      this.logger
    );

    try {
      // Execute the onRequest function if it is defined in the config
      if (MarvelQuery.config.onRequest) {
        this.logger.verbose("Executing onRequest function...");
        MarvelQuery.config.onRequest(url, this.endpoint.path, this.params);
      }

      // Send the HTTP request using the configured HTTP client and await the response
      const response = await MarvelQuery.config.httpClient<E>(url);

      // Stop the timer and log the request performance
      timer.stop("API Request Complete");

      if (
        MarvelQuery.config.validation?.disableAll === false &&
        MarvelQuery.config.validation?.apiResponse === true
      ) {
        // Validate the results in the response if validation is enabled
        this.validated.results = new ResultValidator(
          response.data.results,
          this.endpoint,
          this.logger
        ).allValid;
      }

      // Return the validated response data
      return response;
    } catch (error) {
      this.logger.error("Error occurred during API request:", error);
      throw new Error("Failed to fetch data from Marvel API");
    }
  }

  /**
   * Fetches a single result of the query.
   * Overrides the parameters to set the limit to 1 and offset to 0.
   *
   * @returns A promise that resolves to a single extended result.
   */
  async fetchSingle(): Promise<Result<E, A>> {
    this.logger.verbose("Fetching a single result.");

    // Set parameters to fetch only a single result
    this.params.offset = 0;
    this.params.limit = 1;

    // Fetch the results using the fetch method
    const query = await this.fetch();

    if (!query.results[0]) {
      this.logger.error("No result found.");
      throw new Error("No result found");
    }

    // Return the first (and only) result
    return query.results[0];
  }
}

export default MarvelQuery;
export * from "./models/types/data-types";
export * from "./models/types/param-types";
export * from "./models/types/config-types";
export {
  Endpoint,
  EndpointType,
  EndpointDescriptor,
} from "./models/types/endpoint-types";
