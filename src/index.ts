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
} from "./definitions/types/data-types";
import { ResultSchemaMap } from "./definitions/schemas/data-schemas";
import { ValidateParams } from "./definitions/schemas/param-schemas";

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
  /** Omit the 'the' from the beginning of titles. */
  static omitThe?: boolean = false;
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
   * @param args.omitThe - Omit the 'the' from the beginning of titles.
   * @param args.omitUndefined - Remove undefined parameters from the query
   * @param args.globalParams - Global parameters to be applied to all queries, or all queries of a specific type.
   * @param args.onRequest - An optional function that will be called before the request is sent.
   * @param args.onResult - Add custom functions to be called when a request of a specific type is complete.
   * @param args.fetchFunction - Replace the default fetch function (axios) with your own http client
   ** For more information, visit https://github.com/nikolasstow/MarvelQuery
   */
  static init(args: InitArgs) {
    Object.assign(MarvelQuery, { ...args });
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
  onResult?: OnResultFunction<ResultMap[EndpointType]>;

  /** The data type of the results of the query */
  type: EndpointType;

  constructor(endpoint: Type, params: ParamsType<Type>) {
    // Determine whether the endpoint is an array or ResultType<Type>
    if (typeof endpoint[0] === "string") {
      this.endpoint = endpoint as Type;
    } else {
      // build the end point from the URI
    }

    params = MarvelQuery.omitUndefined ? this.omitUndefined(params) : params;

    // TODO: add type validation
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

    if (MarvelQuery.onResult) {
      this.onResult = MarvelQuery.onResult[this.type];
    }

    if (MarvelQuery.omitThe && "title" in this.params) {
      this.params.title = this.omitThe(this.params.title as string);
    }
  }

  // async fetchSingle() {
  //   this.params.limit = 1;
  //   this.fetch();
  //   return this.result;
  // }

  /** Remove undefined parameters */
  private omitUndefined(params: ParamsType<Type>) {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );
  }

  /** Create a new query with the MarvelQuery class */
  private createQuery<Type extends Endpoint>(
    endpoint: Type,
    params: ParamsType<Type>
  ): MarvelQuery<Type> {
    if (!MarvelQuery.publicKey || !MarvelQuery.privateKey) {
      throw new Error("Missing public or private keys");
    }
    return new MarvelQuery<Type>(endpoint, params);
  }

  /** Validate the parameters of the query, build the URL, send the request and call the onResult function with the results of the request.
   * Then create a MarvelQueryResult with all the properties of the MarvelQuery object, 
   * now with the results of the query, and offset adjusted to request the next page of results.
   */
  async fetch(): Promise<MarvelQueryResult<Type>> {
    this.validateParams();
    const url = this.buildURL();

    try {
      const { data, ...metadata } = await this.request(url);
      const { results, ...responseData } = data;

      const queryResults: MarvelQueryResults<Type> = {
        url,
        metadata,
        responseData,
        results,
      };

      if (this.onResult) {
        this.onResult(results);
      }

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
    const { privateKey, publicKey } = MarvelQuery;
    const hash = privateKey
      ? CryptoJS.MD5(timestamp + privateKey + publicKey).toString()
      : "";

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
      if (MarvelQuery.onRequest) {
        MarvelQuery.onRequest(url);
      }

      let response;

      if (MarvelQuery.fetchFunction) {
        response = await MarvelQuery.fetchFunction(url);
      } else {
        response = await axios.get(url);
      }

      const resultSchema = ResultSchemaMap[this.type];
      if (!resultSchema) {
        throw new Error(`Invalid result schema, ${this.type}`);
      }

      resultSchema.parse(response.data.data.results);

      return response.data as APIWrapper<ResultType<Type>>;
    } catch (error) {
      console.error("Error fetching data from API:", error);
      throw new Error("Failed to fetch data from Marvel API");
    }
  }

  /** Validate the parameters of the query. */
  private validateParams(): void {
    try {
      ValidateParams[this.type].parse(this.params);
    } catch (error) {
      console.error("Parameter validation error:", error);
      throw new Error("Invalid parameters");
    }
  }

  /** Remove the 'the' from the beginning of the title. */
  private omitThe(title: string): string {
    // Remove the 'the' from the beginning of the title
    const prefix = "the ";
    if (title.toLowerCase().startsWith(prefix)) {
      return title.slice(prefix.length);
    }
    return title;
  }
}

export function createQuery<Type extends Endpoint>(
  endpoint: Type,
  params: ParamsType<Type>
): MarvelQuery<Type> {
  if (!MarvelQuery.publicKey || !MarvelQuery.privateKey) {
    throw new Error("Missing public or private keys");
  }
  return new MarvelQuery<Type>(endpoint, params);
}

class MarvelQueryResult<Type extends Endpoint> extends MarvelQuery<Type> {
  url: string;
  metadata: Metadata;
  responseData: APIResponseData;
  result: ResultType<Type>;
  results: ResultType<Type>[];
  resultHistory: ResultType<Type>[];

  constructor(query: MarvelQuery<Type>, results: MarvelQueryResults<Type>) {
    const offset = results.responseData.offset + query.params.limit;
    const params = {
      ...query.params,
      offset,
    };

    super(query.endpoint, params);

    if (results && results.results[0]) {
      this.url = results.url;
      this.metadata = results.metadata;
      this.responseData = results.responseData;
      this.result = results.results[0];
      this.results = results.results;
      this.resultHistory = results.results;
    }
  }

  async fetch(): Promise<MarvelQueryResult<Type>> {
    const total = this.responseData.total;
    const remaining = total - this.params.offset; // Double check this

    if (remaining <= 0) {
      console.error("No more results to fetch");
      return this;
    }

    const { data, ...metadata } = await this.request(this.url);
    const { results, ...responseData } = data;

    if (results && results[0]) {
      this.metadata = metadata;
      this.responseData = responseData;
      this.results = results;
      this.result = results[0];
      this.resultHistory = [...this.resultHistory, ...results];

      if (results.length === 1) {
        this.result = results[0];
      }
    }

    return this;
  }
}

export default MarvelQuery;
export * from "./definitions/types/data-types";
export * from "./definitions/types/param-types";

import * as sample from "./samples";
export { sample };
