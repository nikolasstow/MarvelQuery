import * as CryptoJS from "crypto-js";
import axios, { AxiosResponse } from "axios";

import {
  Endpoint,
  ParamsType,
  ResultType,
  EndpointType,
  OnResultMap,
  OnResultFunction,
  ResultMap,
  APIKeys,
  Config,
  APIWrapper,
  MarvelQueryResults,
  APIResponseData,
  Metadata,
  GlobalParams,
  AnyResultFunction,
  AnyParams,
  FetchFunction,
} from "./definitions/types";
import { ResultSchemaMap } from "./definitions/schemas/data-schemas";
import { ValidateParams } from "./definitions/schemas/param-schemas";
import { unknown } from "zod";

class MarvelQuery<E extends Endpoint> {
  /** Endpoint types that can be queried */
  private static validEndpoints = new Set([
    "comics",
    "characters",
    "creators",
    "events",
    "series",
    "stories",
  ]);

  /** Marvel API public key. Don't have one? Get one at https://developer.marvel.com/ */
  private static publicKey: string;
  /** Marvel API private key. Don't have one? Get one at https://developer.marvel.com/ */
  private static privateKey: string;
  // Configuration Options
  /** Global parameters to be applied to all queries, or all queries of a specific type.
   * @example ```globalParams: {
   * all: { limit: 10 },
   * comics: { noVariants: true }
   * }```
   */
  static globalParams?: GlobalParams;
  /** Remove undefined parameters from the query */
  static omitUndefined?: boolean = true;
  // Functions
  /** An optional function that will be called before the request is sent.
   * You can use it to log the request or track the number of requests to the API. */
  static onRequest?: (url: string) => void;
  /** Add custom functions to be called when a request of a specific type is complete.
   * @example ```onResult: {
   * comics: (items) => {
   *   items.map((comic) => {
   *     console.log("Saving comic:", comic.title);
   *   });
   * }
   * }```
   */
  static onResult?: OnResultMap;
  /** Replace the default fetch function (axios) with your own http client */
  static fetchFunction: FetchFunction = (url) =>
    axios.get(url).then((response) => response.data);
  /** Function to create an instance of the MarvelQuery class */
  private static createQuery = <T extends Endpoint>(
    endpoint: T,
    params: ParamsType<T> = {} as ParamsType<T>
  ): MarvelQuery<T> => {
    /** Validate the endpoint. */
    if (!endpoint) {
      throw new Error("Missing endpoint");
    }
    /** Validate the public and private keys. */
    if (!MarvelQuery.publicKey || !MarvelQuery.privateKey) {
      throw new Error("Missing public or private keys");
    }
    /** Create a new query with the MarvelQuery class. */
    return new MarvelQuery<T>(endpoint, params);
  };
  /** Initialize the API library with your public and private keys and other options.
   * @param keys.publicKey - Marvel API public key.
   * @param keys.privateKey - Marvel API private key.
   *
   ** Don't have keys? Get them at https://developer.marvel.com/
   * @param config.omitUndefined - Remove undefined parameters from the query
   * @param config.globalParams - Global parameters to be applied to all queries, or all queries of a specific type.
   * @param config.onRequest - An optional function that will be called before the request is sent.
   * @param config.onResult - Add custom functions to be called when a request of a specific type is complete.
   * @param config.fetchFunction - Replace the default fetch function (axios) with your own http client.
   ** For more information, visit https://github.com/nikolasstow/MarvelQuery
   */
  static init(keys: APIKeys, config: Config = {}) {
    /** Validate the global parameters. */
    if (config.globalParams) {
      this.validateGlobalParams(config.globalParams);
    }
    /** Initialize the library with public and private keys, and options such as global parameters and custom functions for requests, results, and http client. */
    Object.assign(MarvelQuery, { ...keys, ...config }); // You're probably wonder why keys and config are separate arguments when the get combined anyway... it's because it looks cleaner. Don't judge me.
    /** Pass the createQuery function once the library is initialized. */
    return MarvelQuery.createQuery;
  }

  /** Validate the global parameters. */
  private static validateGlobalParams(globalParams: GlobalParams): void {
    const types = Object.keys(globalParams); // get the keys of the globalParams object
    for (const type of types) {
      if (this.validEndpoints.has(type)) { // check if the endpoint type is valid
        this.validateParams(type as EndpointType, globalParams[type]); // validate the parameters of the query for the endpoint type
      }
    }
  }

  /** Validate the parameters of the query. */
  private static validateParams(type: EndpointType, params: AnyParams): void {
    try {
      // Confirm there's a validation function for the endpoint type
      if (!ValidateParams[type]) {
        throw new Error(`Could not find validation schema for Endpoint: ${type}`);
      }
      // Validate the parameters for the endpoint type
      ValidateParams[type].parse(params);
    } catch (error) {
      console.error("Parameter validation error:", error);
      throw new Error("Invalid parameters");
    }
  }

  /** Endpoint of the query
   * @example http://gateway.marvel.com/v1/public/characters/1009491/comics
   * becomes ["characters", 1009491, "comics"]
   */
  endpoint: E;
  /** Parameters of the query */
  params: ParamsType<E>;
  /** Function that will be called when the query is finished. */
  onResult?: OnResultFunction<ResultMap[EndpointType]> | AnyResultFunction;
  /** The data type of the results of the query */
  type: EndpointType;

  /** The URL of the query
   * @example ```https://gateway.marvel.com/v1/public/characters?apikey=5379d18afd202d5c4bba6b58417240fb&ts=171234567391456&hash=2270ae1a72023bdf71235da7fdbf2352&offset=0&limit=100&name=Peter+Parker```
   */
  url: string;
  /** The number of results returned by the query */
  count: number = 0;
  /** The total number of results available for the query. */
  total: number = 0;
  /** Metadata included in the API response.
   * @property code: The HTTP status code of the returned result.
   * @property status: A string description of the call status.
   * @property copyright: The copyright notice for the returned result.
   * @property attributionText: The attribution notice for this result. Please display either this notice or the contents of the attributionHTML field on all screens which contain data from the Marvel Comics API.
   * @property attributionHTML: An HTML representation of the attribution notice for this result. Please display either this notice or the contents of the attributionText field on all screens which contain data from the Marvel Comics API.
   * @property etag: A digest value of the content returned by the call.
   */
  metadata: Metadata;
  /** Data for the API response.
   * @property offset: The requested offset (number of skipped results) of the call.
   * @property limit: The requested result limit.
   * @property total: The total number of resources available given the current filter set.
   * @property count: The total number of results returned by this call.
   */
  responseData: APIResponseData;
  /** The first result of the query. */
  result: ResultType<E> | undefined;
  /** The results of the query. */
  results: ResultType<E>[];
  /** The conjunction of all results from this query instance. */
  resultHistory: ResultType<E>[] = [];

  /** The query is complete when all results have been fetched. */
  isComplete: boolean = false;
  /** Create a new query with the MarvelQuery class. Validate the endpoint and parameters, and insert default parameters if not provided. */
  constructor(endpoint: E, params: ParamsType<E>) {
    this.initializeEndpoint(endpoint);
    this.initializeParams(params);
    this.initializeResultHandler();
  }

  /** Validate the endpoint and set the data type of the query. */
  private initializeEndpoint(endpoint: E): void {
    /** Validate the endpoint. */
    this.endpoint = this.validateEndpoint(endpoint);
    /** Determine the data type of the query from the endpoint. */
    this.type = (
      endpoint.length === 3 ? endpoint[2] : endpoint[0]
    ) as EndpointType;
  }

  /** Validate the endpoint */
  private validateEndpoint(endpoint: E): E {
    /** Validate the endpoint. */
    if (!endpoint) {
      throw new Error("Endpoint is required");
    }

    // Validation methods for endpoint parts
    const validate = {
      type: (element?: string) => {
        if (element && !MarvelQuery.validEndpoints.has(element)) {
          throw new Error(`Unknown endpoint type: ${element}`);
        }
      },
      id: (element?: number) => {
        if (element && typeof element !== "number") {
          throw new Error(`Invalid endpoint id: ${element}`);
        }
      },
    };

    const [first, second, third] = endpoint;

    validate.type(first);
    validate.id(second);
    validate.type(third);

    /** Validate that the first and third elements of the endpoint are not the same. */
    if (first && third && first === third) {
      throw new Error(
        `Invalid endpoint: ${endpoint[0]} and ${endpoint[2]} cannot be the same type`
      );
    }

    return endpoint;
  }

  /** Clean, validate, and set the parameters. */
  private initializeParams(params: ParamsType<E>): void {
    /** Remove undefined parameters unless 'omitUndefined' is false. */
    const cleanParams = MarvelQuery.omitUndefined
      ? this.omitUndefined(params)
      : params;

    /** Validate the parameters. */
    MarvelQuery.validateParams(this.type, cleanParams);

    this.params = {
      // Default parameters
      offset: 0,
      limit: 50,
      // Global parameters
      ...MarvelQuery.globalParams?.all,
      ...MarvelQuery.globalParams?.[this.type],
      // Specific parameters
      ...params,
    };
  }

  /** Remove undefined parameters. */
  private omitUndefined(params: ParamsType<E>): ParamsType<E> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    ) as ParamsType<E>;
  }

  /** Set the onResult function for the specific type, or the 'any' type if not provided. */
  private initializeResultHandler(): void {
    /** Set the onResult function for the specific type, or the 'any' type if not provided. */
    if (MarvelQuery.onResult) {
      const typeSpecificOnResult = MarvelQuery.onResult[this.type];
      this.onResult = typeSpecificOnResult
        ? typeSpecificOnResult
        : MarvelQuery.onResult.any;
    }
  }

  /** Validate the parameters of the query, build the URL, send the request and call the onResult function with the results of the request.
   * Then create a MarvelQueryResult with all the properties of the MarvelQuery object,
   * now with the results of the query, and offset adjusted to request the next page of results.
   */
  async fetch(): Promise<MarvelQuery<E>> {
    /** Build the URL of the query with the parameters, keys, timestamp and hash. */
    const url = this.buildURL();

    if (this.url === url) {
      throw new Error("Duplicate request");
    }

    try {
      /** Send the request and call the onResult function with the results of the request. */
      const { data, ...metadata } = await this.request(url);
      const { results, ...responseData } = data;
      const { total, count, offset } = responseData;

      /** Determine the remaining number of results. */
      const fetched = offset + count;
      const remaining = total - fetched;

      this.count = fetched;
      this.params.offset = fetched;

      const complete = this.verify(remaining <= 0, "No more results found");
      const duplicateResults = this.verify(
        results === this.results,
        "Duplicate results"
      );
      const noResults = this.verify(!results.length, "No results found");

      this.isComplete = complete || duplicateResults || noResults;
      this.metadata = metadata;
      this.responseData = responseData;
      this.results = results;
      this.result = results[0];
      this.resultHistory = [...this.resultHistory, ...results];

      /** Call the onResult function with the results of the request. */
      if (this.onResult) {
        this.onResult(results);
      }

      return this;
    } catch (error) {
      console.error("Request error:", error);
      throw new Error("Request error");
    }
  }

  /** Verify that the condition is true, and if not, throw a warning. */
  verify(logic: boolean, message: string) {
    if (logic) {
      console.warn(message);
    }

    return logic;
  }

  /** Build the URL of the query with the parameters, timestamp and hash. */
  buildURL(): string {
    const baseURL = "https://gateway.marvel.com/v1/public";
    const endpoint = this.endpoint.join("/");
    const timestamp = Number(new Date());
    /** Extract the public and private keys from the library initialization. */
    const { privateKey, publicKey } = MarvelQuery;
    /** Create an MD5 hash with the timestamp, private key and public key. */
    const hash = privateKey
      ? CryptoJS.MD5(timestamp + privateKey + publicKey).toString()
      : "";

    /** Build the URL of the query with the parameters, keys, timestamp and hash. */
    const queryParams = new URLSearchParams({
      apikey: publicKey,
      ts: timestamp.toString(),
      hash,
      ...(this.params as Record<string, unknown>),
    });

    return `${baseURL}/${endpoint}?${queryParams.toString()}`;
  }

  /** Send the request to the API, and validate the response. */
  async request(url: string): Promise<APIWrapper<ResultType<E>>> {
    try {
      /** Call the onRequest function if it is defined. */
      if (MarvelQuery.onRequest) {
        MarvelQuery.onRequest(url);
      }

      const response = await MarvelQuery.fetchFunction<E>(url);

      this.validateResults(response.data.results);

      /** Return the response data. */
      return response;
    } catch (error) {
      console.error("Error fetching data from API:", error);
      throw new Error("Failed to fetch data from Marvel API");
    }
  }

  /** Validate the results of the query. */
  private validateResults(results: ResultType<E>[]) {
    /** Determine expected result schema */
    const resultSchema = ResultSchemaMap[this.type];
    if (!resultSchema) {
      throw new Error(`Invalid result schema, ${this.type}`);
    }

    /** Validate the response data with the result schema. */
    const result = resultSchema.safeParse(results);
    if (!result.success) {
      console.error("Error validating results:", result.error);
    }
  }

  /** Fetch a single result of the query. This will override the parameters to set the limit to 1 and offset to 0 */
  async fetchSingle(): Promise<MarvelQuery<E>> {
    this.params.offset = 0;
    this.params.limit = 1;
    return this.fetch();
  }
}

export default MarvelQuery;
export * from "./definitions/types";
