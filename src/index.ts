import * as CryptoJS from "crypto-js";
import axios from "axios";

import {
  Endpoint,
  Parameters,
  ParamsType,
  ResultType,
  EndpointType,
  OnResultMap,
  OnResultFunction,
  ResultMap,
  InitArgs,
  APIWrapper,
  MarvelQueryResults,
  APIResponseData,
  ExtendEndpointParams,
  Metadata,
  GlobalParams,
  AnyResultFunction,
} from "./definitions/types/data-types";
import { ResultSchemaMap } from "./definitions/schemas/data-schemas";
import { ValidateParams } from "./definitions/schemas/param-schemas";

/** Base class for all queries, constructs the URL, sends the request,
 * and validates the query parameters and the response using zod. */
class MarvelQuery<Type extends Endpoint> {
  /** Marvel API public key. Don't have one? Get one at https://developer.marvel.com/ */
  static publicKey: string;
  /** Marvel API private key. Don't have one? Get one at https://developer.marvel.com/ */
  static privateKey: string;
  // Options
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
  static fetchFunction?: (url: string) => Promise<unknown>;
  /** Initialize the API library with your public and private keys and other options.
   * @param args.publicKey - Marvel API public key.
   * @param args.privateKey - Marvel API private key.
   *
   ** Don't have keys? Get them at https://developer.marvel.com/
   * @param args.omitUndefined - Remove undefined parameters from the query
   * @param args.globalParams - Global parameters to be applied to all queries, or all queries of a specific type.
   * @param args.onRequest - An optional function that will be called before the request is sent.
   * @param args.onResult - Add custom functions to be called when a request of a specific type is complete.
   * @param args.fetchFunction - Replace the default fetch function (axios) with your own http client.
   ** For more information, visit https://github.com/nikolasstow/MarvelQuery
   */
  static init(args: InitArgs) {
    /** Initialize the library with public and private keys, and options such as global parameters and custom functions for requests, results, and http client. */
    Object.assign(MarvelQuery, { ...args });
    /** Pass the createQuery function once the library is initialized. */
    return createQuery;
  }

  /** Endpoint of the query
   * @example http://gateway.marvel.com/v1/public/characters/1009491/comics
   * becomes ["characters", 1009491, "comics"]
   */
  endpoint: Type;
  /** Parameters of the query */
  params: Parameters<Type>;
  /** Function that will be called when the query is finished. */
  onResult?: OnResultFunction<ResultMap[EndpointType]> | AnyResultFunction;

  /** The data type of the results of the query */
  type: EndpointType;

  /** Create a new query with the MarvelQuery class. Validate the endpoint and parameters, and insert default parameters if not provided. */
  constructor(endpoint: Type, params: ParamsType<Type>) {
    /** Validate the endpoint. */
    this.endpoint = this.validateEndpoint(endpoint);
    /** Remove undefined parameters unless 'omitUndefined' is false. */
    params = MarvelQuery.omitUndefined ? this.omitUndefined(params) : params;

    /** Determine the data type of the query from the endpoint. */
    this.type = (
      endpoint.length === 3 ? endpoint[2] : endpoint[0]
    ) as EndpointType;

    this.params = {
      // Default parameters
      offset: 0,
      limit: 100,
      // Global parameters
      ...MarvelQuery.globalParams?.all,
      ...MarvelQuery.globalParams?.[this.type],
      // Specific parameters
      ...params,
    };

    /** Set the onResult function for the specific type, or the 'any' type if not provided. */
    if (MarvelQuery.onResult) {
      const typeSpecificOnResult = MarvelQuery.onResult[this.type];
      this.onResult = typeSpecificOnResult
        ? typeSpecificOnResult
        : MarvelQuery.onResult["any"];
    }
  }

  private validateEndpoint(endpoint: Type): Type {
    /** Validate the endpoint. */
    if (!endpoint) {
      throw new Error("Endpoint is required");
    }
    /** Array of valid endpoint types. */
    const endpoints = [
      "comics",
      "characters",
      "creators",
      "events",
      "series",
      "stories",
    ];

    /** Validate the first element of the endpoint is a valid endpoint type */
    if (!endpoints.includes(endpoint[0])) {
      throw new Error(`Invalid endpoint[0]: ${endpoint[0]}`);
    }
    /** Validate the second element of the endpoint is a number. */
    if (endpoint[1] &&  typeof endpoint[1] !== "number") {
      throw new Error(`Invalid endpoint[1]: ${endpoint[1]}`);
    }
    /** Validate the third element of the endpoint is a valid endpoint type */
    if (endpoint[2] && !endpoints.includes(endpoint[2])) {
      throw new Error(`Invalid endpoint[2]: ${endpoint[2]}`);
    }
    /** Validate that the first and third elements of the endpoint are not the same. */
    if (endpoint[0] == endpoint[2]) {
      throw new Error(`Invalid endpoint: ${endpoint[0]} and ${endpoint[2]}
  cannot be the same endpoint`);
    }

    return endpoint;
  }

  /** Remove undefined parameters. */
  private omitUndefined(params: ParamsType<Type>) {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );
  }

  /** Validate the parameters of the query, build the URL, send the request and call the onResult function with the results of the request.
   * Then create a MarvelQueryResult with all the properties of the MarvelQuery object,
   * now with the results of the query, and offset adjusted to request the next page of results.
   */
  async fetch(): Promise<MarvelQueryResult<Type>> {
    /** Validate the parameters of the query. */
    this.validateParams();
    /** Build the URL of the query with the parameters, keys, timestamp and hash. */
    const url = this.buildURL();

    try {
      /** Send the request and call the onResult function with the results of the request. */
      const { data, ...metadata } = await this.request(url);
      const { results, ...responseData } = data;

      const queryResults: MarvelQueryResults<Type> = {
        url,
        metadata,
        responseData,
        results,
      };

      /** Call the onResult function with the results of the request. */
      if (this.onResult) {
        this.onResult(results);
      }

      /** Create a MarvelQueryResult with all the properties of the MarvelQuery object, now with the results of the query, and offset adjusted to request the next page of results. */
      return new MarvelQueryResult<Type>(this, queryResults);
    } catch (error) {
      console.error("Request error:", error);
      throw new Error("Request error");
    }
  }

  /** Build the URL of the query with the parameters, timestamp and hash. */
  buildURL() {
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
      ...(this.params as Record<string, string>),
    });

    return `${baseURL}/${endpoint}?${queryParams.toString()}`;
  }

  /** Send the request to the API, and validate the response. */
  async request(url: string): Promise<APIWrapper<ResultType<Type>>> {
    try {
      /** Call the onRequest function if it is defined. */
      if (MarvelQuery.onRequest) {
        MarvelQuery.onRequest(url);
      }

      let response;

      /** Use the custom http client if the fetchFunction is defined. */
      if (MarvelQuery.fetchFunction) {
        response = await MarvelQuery.fetchFunction(url);
      } else {
        response = await axios.get(url);
      }

      /** Determine expected result schema */
      const resultSchema = ResultSchemaMap[this.type];
      if (!resultSchema) {
        throw new Error(`Invalid result schema, ${this.type}`);
      }

      /** Validate the response data with the result schema. */
      resultSchema.parse(response.data.data.results);

      /** Return the response data. */
      return response.data as APIWrapper<ResultType<Type>>;
    } catch (error) {
      console.error("Error fetching data from API:", error);
      throw new Error("Failed to fetch data from Marvel API");
    }
  }

  /** Validate the parameters of the query. */
  private validateParams(): void {
    try {
      /** Validate the parameters of the query using the schema determined by the endpoint type. */
      ValidateParams[this.type].parse(this.params);
    } catch (error) {
      console.error("Parameter validation error:", error);
      throw new Error("Invalid parameters");
    }
  }
}

/** Create a new query with the MarvelQuery class. */
function createQuery<Type extends Endpoint>(
  endpoint: Type,
  params: ParamsType<Type>
): MarvelQuery<Type> {
  /** Validate the endpoint. */
  if (!endpoint) {
    throw new Error("Missing endpoint");
  }
  /** Validate the public and private keys. */
  if (!MarvelQuery.publicKey || !MarvelQuery.privateKey) {
    throw new Error("Missing public or private keys");
  }
  /** Create a new query with the MarvelQuery class. */
  return new MarvelQuery<Type>(endpoint, params);
}

/** Extension of the MarvelQuery class with query results and helper functions. */
class MarvelQueryResult<Type extends Endpoint> extends MarvelQuery<Type> {
  /** The URL of the query
   * @example ```https://gateway.marvel.com/v1/public/characters?apikey=5379d18afd202d5c4bba6b58417240fb&ts=171234567391456&hash=2270ae1a72023bdf71235da7fdbf2352&offset=0&limit=100&name=Peter+Parker```
   */
  url: string;
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
  result: ResultType<Type>;
  /** The results of the query. */
  results: ResultType<Type>[];
  /** The conjunction of all results from this query instance. */
  resultHistory: ResultType<Type>[];

  /** Creates a MarvelQueryResult with all the properties of the MarvelQuery object, now with the results of the query, and offset adjusted to request the next page of results. */
  constructor(query: MarvelQuery<Type>, results: MarvelQueryResults<Type>) {
    /** Increment the offset by the limit to get the next page */
    const offset = results.responseData.offset + query.params.limit;
    /** Update the params with the new offset */
    const params = {
      ...query.params,
      offset,
    };

    /** Call the parent constructor with the updated params */
    super(query.endpoint, params);

    /** Update properties with the response from the API */
    if (results && results.results[0]) {
      this.url = results.url;
      this.metadata = results.metadata;
      this.responseData = results.responseData;
      this.result = results.results[0];
      this.results = results.results;
      this.resultHistory = results.results;
    }
  }
  /** Calling fetch again will fetch the next page of results. */
  async fetch(): Promise<MarvelQueryResult<Type>> {
    const total = this.responseData.total;
    const remaining = total - this.params.offset;
    /** If there are no more results to fetch, stop and return the current instance. */
    if (remaining <= 0) {
      console.error("No more results to fetch");
      return this;
    }

    /** Fetch the next page of results. */
    const { data, ...metadata } = await this.request(this.url);
    const { results, ...responseData } = data;

    if (results && results[0]) {
      /** Update properties with the response from the API */
      this.metadata = metadata;
      this.responseData = responseData;
      this.results = results;
      this.result = results[0];
      this.resultHistory = [...this.resultHistory, ...results];
    }
    /** Increment the offset by the limit to get the next page. */
    const offset = this.responseData.offset + this.responseData.limit;
    this.params = {
      ...this.params,
      offset,
    };

    /** Return the current instance. */
    return this;
  }
}

export default MarvelQuery;
export * from "./definitions/types/data-types";
export * from "./definitions/types/param-types";
