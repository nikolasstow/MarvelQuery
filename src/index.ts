import axios from "axios";
import logger, { setVerbose } from "./utils/Logger";
import {
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
import { buildURL } from "./utils/functions";
import { verify } from "./utils/validate";
import { ExtendQuery } from "./utils/ExtendQuery";

export class MarvelQuery<E extends Endpoint>
  implements MarvelQueryInterface<E>
{
  /** ********* Static Properties ********* */

  static apiKeys: APIKeys;

  /** Configurable properties | Defaults */
  static config: Config = {
    globalParams: {},
    omitUndefined: true,
    verbose: false,
    httpClient: (url) => axios.get(url).then((response) => response.data),
  };

  /** Function to create an instance of the MarvelQuery class */
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

  static init(
    apiKeys: APIKeys,
    config: Partial<Config> = {}
  ): CreateQueryFunction {
    setVerbose(MarvelQuery.config.verbose);
    logger.verbose("Initializing MarvelQuery. Setting up global config...");

    MarvelQuery.apiKeys = apiKeys;
    Object.assign(MarvelQuery.config, config);
    
    if (config.globalParams) {
      validateGlobalParams(config.globalParams);
    }

    return MarvelQuery.createQuery;
  }

  /** Function that will be called when the query is finished. */
  private onResult?:
    | OnResultFunction<ResultMap[EndpointType]>
    | AnyResultFunction;

  /** Endpoint of the query */
  endpoint: EndpointDescriptor<E>;
  /** Parameters of the query */
  params: Parameters<E>;
  /** The data type of the results of the query */
  type: EndpointType;

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
  /** The conjunction of all results from this query instance. */
  resultHistory: ExtendResult<E>[] = [];

  /** The query is complete when all results have been fetched. */
  isComplete: boolean = false;

  /** Extend the query with additional properties. */
  extendQuery: ExtendQuery<E>;

  /** Create a new query with the MarvelQuery class. Validate the endpoint and parameters, and insert default parameters if not provided. */
  constructor({ endpoint, params }: InitQuery<E>) {
    this.endpoint = initializeEndpoint(endpoint);
    this.params = initializeParams(params, MarvelQuery.config, this.endpoint);

    this.extendQuery = new ExtendQuery(MarvelQuery, this.endpoint);

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

  /** Validate the parameters of the query, build the URL, send the request and call the onResult function with the results of the request.
   * Then create a MarvelQueryResult with all the properties of the MarvelQuery object,
   * now with the results of the query, and offset adjusted to request the next page of results.
   */
  async fetch(): Promise<MarvelQuery<E>> {
    logger.verbose(`Fetching results for endpoint: ${this.endpoint.path.join("/")}`);
    logger.verbose("Parameters:", this.params);

    /** Build the URL of the query with the parameters, keys, timestamp, and hash. */
    const url = buildURL(MarvelQuery.apiKeys, this.endpoint, this.params);

    if (this.url === url) {
      logger.error("Duplicate request detected. Aborting fetch.");
      throw new Error("Duplicate request");
    }

    this.url = url;

    try {
      /** Send the request and call the onResult function with the results of the request. */
      logger.verbose(`Sending request to URL: ${url}`);
      const { data, ...metadata } = await this.request(url);
      const { results, ...responseData } = data;
      const { total, count, offset } = responseData;

      /** Determine the remaining number of results. */
      const fetched = offset + count;
      const remaining = total - fetched;

      this.count = fetched;
      this.params.offset = fetched;

      logger.verbose(`Fetched ${count} results. Total fetched: ${fetched}/${total}. Remaining: ${remaining}.`);

      const noResults = verify(!results.length, "No results found");

      const complete = verify(remaining <= 0, "No more results found");
      const duplicateResults =
        this.resultHistory.length > 0
          ? verify(
              results.map((result) => result.id) ===
                this.results.map((result) => result.id),
              "Duplicate results"
            )
          : false;

      const formattedResults = results.map((result) =>
        this.extendQuery.extendResult(result)
      );

      this.isComplete = complete || duplicateResults || noResults;
      this.metadata = metadata;
      this.responseData = responseData;
      this.results = formattedResults;
      this.resultHistory = [...this.resultHistory, ...formattedResults];

      logger.verbose("Results processed and extended.");

      /** Call the onResult function with the results of the request. */
      if (this.onResult) {
        logger.verbose("Calling onResult function with the processed results.");
        this.onResult(results);
      }

      return this as MarvelQuery<E>;
    } catch (error) {
      logger.error("An error occurred during fetch:", error);
      throw new Error("Request error");
    }
  }

  /** Send the request to the API, and validate the response. */
  async request(url: string): Promise<APIWrapper<Result<E>>> {
    const timer = logger.performance(`Requesting data from: ${url}`)

    try {
      /** Call the onRequest function if it is defined. */
      if (MarvelQuery.config.onRequest) {
        logger.verbose("Executing onRequest function...");
        MarvelQuery.config.onRequest(url, this.endpoint.path, this.params);
      }

      const response = await MarvelQuery.config.httpClient<E>(url);

      timer.stop("Received API response.");

      validateResults(response.data.results, this.endpoint);

      /** Return the response data. */
      return response;
    } catch (error) {
      logger.error("Error occurred during API request:", error);
      throw new Error("Failed to fetch data from Marvel API");
    }
  }

  /** Fetch a single result of the query. This will override the parameters to set the limit to 1 and offset to 0 */
  async fetchSingle(): Promise<ExtendResult<E>> {
    logger.verbose("Fetching a single result.");
    this.params.offset = 0;
    this.params.limit = 1;

    const query = await this.fetch();

    if (!query.results[0]) {
      logger.error("No result found for the single fetch request.");
      throw new Error("No result found.");
    }

    return query.results[0];
  }
}

export default MarvelQuery;
export * from "./models/types";