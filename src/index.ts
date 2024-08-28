import axios from "axios";
import logger, { setVerbose } from "./utils/Logger";
import type {
  Endpoint,
  Parameters,
  Result,
  EndpointType,
  OnResultFunction,
  ResultMap,
  APIKeys,
  Config,
  AnyResultFunction,
  MarvelQueryInterface,
  InitQuery,
  APIWrapper,
  APIResponseData,
  Metadata,
  ExtendResult,
  AsEndpoint,
  EndpointDescriptor,
  CreateQueryFunction,
} from "./models/types";
import { validateGlobalParams, validateResults } from "./utils/validate";
import { initializeEndpoint, initializeParams } from "./utils/initialize";
import { buildURL, logPerformance } from "./utils/functions";
import { verify } from "./utils/validate";
import { AutoQuery } from "./utils/AutoQuery";

/**
 * The MarvelQuery class is responsible for handling requests to the Marvel API.
 * It manages the process of constructing queries, sending requests, processing results,
 * and extending the results with additional functionality.
 *
 * @template E The endpoint type, extending the base Endpoint type.
 */
export class MarvelQuery<E extends Endpoint>
  implements MarvelQueryInterface<E>
{
  /** ********* Static Properties ********* */
  /** Stores the API keys used for authentication with the Marvel API */
  static apiKeys: APIKeys;

  /**
   * Configuration settings for the MarvelQuery class.
   * These include global parameters, verbosity, HTTP client, and more.
   * The default configuration can be overridden when initializing the class.
   */
  static config: Config = {
    globalParams: {},
    omitUndefined: true,
    verbose: false,
    httpClient: (url) => axios.get(url).then((response) => response.data),
  };

  /**
   * Creates a new instance of the MarvelQuery class.
   *
   * @template T The type of the endpoint or endpoint type.
   * @param endpoint The endpoint to query.
   * @param params Optional parameters for the query.
   * @returns A new instance of MarvelQueryInterface for the specified endpoint.
   */
  private static createQuery = <T extends Endpoint | EndpointType>(
    endpoint: T,
    params: Parameters<AsEndpoint<T>> = {} as Parameters<AsEndpoint<T>>
  ): MarvelQueryInterface<AsEndpoint<T>> =>
    new MarvelQuery<AsEndpoint<T>>({
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
  static init(
    apiKeys: APIKeys,
    config: Partial<Config> = {}
  ): CreateQueryFunction {
    // Set verbose logging based on the configuration
    setVerbose(MarvelQuery.config.verbose);
    logger.verbose("Initializing MarvelQuery. Setting up global config...");

    // Assign API keys and merge the provided config with the default config
    MarvelQuery.apiKeys = apiKeys;
    MarvelQuery.config = { ...MarvelQuery.config, ...config };

    // Validate global parameters if provided
    if (config.globalParams) {
      validateGlobalParams(config.globalParams);
    }

    return MarvelQuery.createQuery;
  }

  /** ********* Instance Properties ********* */
  /**
   * A function to be called when the query is finished.
   * This can be specific to the endpoint type or a general function.
   */
  private onResult?:
    | OnResultFunction<ResultMap[EndpointType]>
    | AnyResultFunction;

  /**
   * Endpoint path as an array, and the type of the endpoint
   * @example http://gateway.marvel.com/v1/public/characters/1009491/comics
   * becomes { path: ["characters", "1009491", "comics"], type: "comics" }
   *  */
  endpoint: EndpointDescriptor<E>;
  /** Parameters of the query */
  params: Parameters<E>;
  /** The URL of the query */
  url: string;
  /** The number of results returned by the query. */
  count: number = 0;
  /** The total number of results available for the query. */
  total: number = 0;
  /** Metadata included in the API response. */
  metadata: Metadata;
  /** Data for the API response. */
  responseData: APIResponseData;
  /** The results of the query. */
  results: ExtendResult<E>[];
  /** A history of all results returned by this query instance.. */
  resultHistory: ExtendResult<E>[] = [];
  /** The query is complete when all results have been fetched. */
  isComplete: boolean = false;

  /**
   * Constructs a new instance of the MarvelQuery class.
   * Validates the endpoint and parameters, and inserts default parameters if not provided.
   *
   * @param initQuery An object containing the endpoint and parameters for the query.
   */
  constructor({ endpoint, params }: InitQuery<E>) {
    // Initialize the endpoint and parameters for the query
    this.endpoint = initializeEndpoint(endpoint);
    this.params = initializeParams(params, MarvelQuery.config, this.endpoint);

    logger.verbose(`Created new query for endpoint: ${endpoint.join("/")}`);

    /** Set the onResult function for the specific type, or the 'any' type if not provided. */
    if (MarvelQuery.config.onResult) {
      logger.verbose(`Setting onResult function for ${this.endpoint.type}`);
      const typeSpecificOnResult =
        MarvelQuery.config.onResult[this.endpoint.type];
      this.onResult = typeSpecificOnResult
        ? typeSpecificOnResult
        : MarvelQuery.config.onResult.any;
    }
  }

  /**
   * Fetches the results for the query, processes them, and calls the onResult function.
   *
   * @returns A promise that resolves to the MarvelQuery instance.
   */
  async fetch(): Promise<MarvelQuery<E>> {
    // Build the URL for the API request using the endpoint and parameters
    this.url = buildURL(MarvelQuery.apiKeys, this.endpoint, this.params);

    // Send the request and await the response
    const response = await this.request(this.url);

    // Process the response, and extend the results with the additional properties
    const processedResults = this.processResults(response);

    // Call the onResult function if it is defined
    this.callOnResult(processedResults);
    // Return the MarvelQuery instance for method chaining
    return this;
  }

  /**
   * Processes the results returned by the API, extending them with additional properties.
   *
   * @param response The API response containing the results to process.
   * @returns An array of extended results.
   */
  private processResults(response: APIWrapper<Result<E>>): ExtendResult<E>[] {
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

    logger.verbose(
      `Fetched ${count} results. Total fetched: ${fetched}/${total}. Remaining: ${remaining}.`
    );

    // Check if no results were returned
    const noResults = verify(!results.length, "No results found");

    // Check if all results have been fetched for this query
    const complete = verify(remaining <= 0, "No more results found");

    // Check for duplicate results by comparing IDs with the previous results
    const duplicateResults =
      this.resultHistory.length > 0
        ? verify(
            results.map((result) => result.id) ===
              this.results.map((result) => result.id),
            "Duplicate results"
          )
        : false;

    /**
     * Create an instance of the AutoQuery class, passing the MarvelQuery class with the query endpoint.
     * Results are passed to the inject() method where they are processed and injected with properties
     * and a query method that returns an instance of the MarvelQuery class passed in the constructor.
     */
    const autoQuery = new AutoQuery<E>(MarvelQuery, this.endpoint);
    const formattedResults = autoQuery.inject(results);

    // Update the instance properties
    this.isComplete = complete || duplicateResults || noResults;
    this.metadata = metadata;
    this.responseData = responseData;
    this.results = formattedResults;
    this.resultHistory = [...this.resultHistory, ...formattedResults];

    logger.verbose("Results processed and extended.");
    return formattedResults;
  }

  /**
   * Calls the onResult function with the processed results, if it is defined.
   *
   * @param results The processed results to pass to the onResult function.
   */
  private callOnResult(results: ExtendResult<E>[]): void {
    if (this.onResult) {
      logger.verbose("Calling onResult function with the processed results.");
      this.onResult(results);
    }
  }

  /**
   * Sends the request to the API and validates the response.
   *
   * @param url The URL to send the request to.
   * @returns A promise that resolves to the API response wrapped in an APIWrapper.
   */
  @logPerformance
  async request(url: string): Promise<APIWrapper<Result<E>>> {
    logger.verbose(`Sending request to URL: ${this.url}`);

    try {
      // Execute the onRequest function if it is defined in the config
      if (MarvelQuery.config.onRequest) {
        logger.verbose("Executing onRequest function...");
        MarvelQuery.config.onRequest(url, this.endpoint.path, this.params);
      }

      // Send the HTTP request using the configured HTTP client and await the response
      const response = await MarvelQuery.config.httpClient<E>(url);

      // Validate the results in the response
      validateResults(response.data.results, this.endpoint);

      // Return the validated response data
      return response;
    } catch (error) {
      logger.error("Error occurred during API request:", error);
      throw new Error("Failed to fetch data from Marvel API");
    }
  }

  /**
   * Fetches a single result of the query.
   * Overrides the parameters to set the limit to 1 and offset to 0.
   *
   * @returns A promise that resolves to a single extended result.
   */
  async fetchSingle(): Promise<ExtendResult<E>> {
    logger.verbose("Fetching a single result.");

    // Set parameters to fetch only a single result
    this.params.offset = 0;
    this.params.limit = 1;

    // Fetch the results using the fetch method
    const query = await this.fetch();

    if (!query.results[0]) {
      logger.error("No result found.");
      throw new Error("No result found");
    }

    // Return the first (and only) result
    return query.results[0];
  }
}

export default MarvelQuery;
export * from "./models/types";
