import * as CryptoJS from "crypto-js";
import axios, { AxiosResponse } from "axios";

import {
  Endpoint,
  Parameters,
  Result,
  EndpointType,
  OnResultMap,
  OnResultFunction,
  ResultMap,
  APIKeys,
  Config,
  GlobalParams,
  AnyResultFunction,
  AnyParams,
  HTTPClient,
  OnRequestFunction,
  Extendpoint,
  MarvelQueryInterface,
  InitQuery,
  InitializedQuery,
  // data types
  List,
  APIWrapper,
  APIResponseData,
  Metadata,
  // extended types
  ReturnType,
  ExtendResult,
  ExtendType,
  ExtendResource,
  ExtendCollection,
  ExtendResourceProperties,
  ExtendCollectionProperties,
  NoSameEndpointType,
  ResourceEndpoint,
  NewEndpoint,
  ExtendedQueryResult,
  DateDescriptor,
  ResourceItem,
  ExtendResourceList,
  AsEndpoint,
  EndpointDescriptor,
  CreateQueryFunction,
} from "./models/types";
import { ResultSchemaMap } from "./models/schemas/data-schemas";
import { ValidateParams } from "./models/schemas/param-schemas";
import { ENDPOINT_MAP, VALID_ENDPOINTS } from "./models/endpoints";
import {
  validateEndpoint,
  validateGlobalParams,
  validateParams,
  validateResults,
} from "./utils/validate";
import { initializeEndpoint, initializeParams } from "./utils/initialize";
import { buildURL, createEndpointFromURI, extractIdFromURI, hasCollectionURI, hasResourceURI, typeFromEndpoint } from "./utils/functions";
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
    MarvelQuery.log("Initializing MarvelQuery...");

    MarvelQuery.apiKeys = apiKeys;

    Object.assign(MarvelQuery.config, config);

    if (config.globalParams) {
      validateGlobalParams(config.globalParams);
    }

    MarvelQuery.log("Initialization complete.");

    return MarvelQuery.createQuery;
  }

  private static log(message: string) {
    if (MarvelQuery.config.verbose) {
      console.log(message);
    }
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
  /** Metadata included in the API response.
   */
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

    /** Set the onResult function for the specific type, or the 'any' type if not provided. */
    if (MarvelQuery.config.onResult) {
      const typeSpecificOnResult =
        MarvelQuery.config.onResult[this.endpoint.type];
      this.onResult = typeSpecificOnResult
        ? typeSpecificOnResult
        : MarvelQuery.config.onResult.any;
    }
  }

  // private extendResult(result: Result<E>): ExtendResult<E> {
  //   const endpoint = this.endpoint.path;
  //   const propertiesExtended: ExtendType<E> = Object.keys(result).reduce<
  //     ExtendType<E>
  //   >((acc, key) => {
  //     const value = result[key];
  //     const keyEndpointType: EndpointType | undefined =
  //       ENDPOINT_MAP[this.endpoint.type][key];

  //     if (!keyEndpointType) {
  //       acc[key] = value;
  //       return acc;
  //     }

  //     if (hasResourceURI(value)) {
  //       // ExtendedResource<E, K>
  //       acc[key] = this.extendResource(value, [keyEndpointType]);
  //     } else if (hasCollectionURI(value)) {
  //       // ExtendedCollection<E, K, Result<E>[K]>
  //       acc[key] = this.extendCollection(value, keyEndpointType);
  //     } else if (Array.isArray(value) && hasResourceURI(value[0])) {
  //       // ExtendedResourceArray<E, K>
  //       acc[key] = this.extendResourceArray(value, [keyEndpointType]);
  //     }

  //     return acc;
  //   }, {} as ExtendType<E>);

  //   const resultExtendingProperties: ExtendResourceProperties<E> = {
  //     endpoint,
  //     fetch: () => {
  //       const query = new MarvelQuery<E>({
  //         endpoint,
  //         params: {} as Parameters<E>,
  //       });
  //       return query.fetch();
  //     },
  //     fetchSingle: () => {
  //       const query = new MarvelQuery<E>({
  //         endpoint,
  //         params: {} as Parameters<E>,
  //       });
  //       return query.fetchSingle();
  //     },
  //     query: <TType extends NoSameEndpointType<E>>(
  //       type: TType,
  //       params: Parameters<Extendpoint<E, TType>>
  //     ): MarvelQueryInterface<Extendpoint<E, TType>> => {
  //       return new MarvelQuery<Extendpoint<E, TType>>({
  //         endpoint: [endpoint[0], endpoint[1], type] as Extendpoint<E, TType>,
  //         params,
  //       });
  //     },
  //   };

  //   return {
  //     ...propertiesExtended,
  //     ...resultExtendingProperties,
  //   };
  // }

  // private extendResource<V extends ResourceItem, BEndpoint extends Endpoint>(
  //   value: V,
  //   baseEndpoint: BEndpoint
  // ) {
  //   const id: number = extractIdFromURI(value.resourceURI);
  //   const baseType = typeFromEndpoint(baseEndpoint);
  //   const endpoint: ResourceEndpoint<BEndpoint> = [
  //     baseType,
  //     id,
  //   ] as ResourceEndpoint<BEndpoint>;

  //   return (<TEndpoint extends Endpoint>(
  //     endpoint: TEndpoint
  //   ): ExtendResource<TEndpoint, V> => {
  //     const additionalProps: ExtendResourceProperties<TEndpoint> = {
  //       endpoint,
  //       fetch: () => {
  //         // Does this actually work?
  //         const query = new MarvelQuery({
  //           endpoint,
  //           params: {} as Parameters<TEndpoint>,
  //         });

  //         return query.fetch();
  //       },
  //       fetchSingle: () => {
  //         // Does this actually work?
  //         const query = new MarvelQuery({
  //           endpoint,
  //           params: {} as Parameters<TEndpoint>,
  //         });

  //         return query.fetchSingle();
  //       },
  //       query: <TType extends EndpointType>(
  //         type: TType,
  //         params: Parameters<Extendpoint<TEndpoint, TType>> = {} as Parameters<
  //           Extendpoint<TEndpoint, TType>
  //         >
  //       ): MarvelQueryInterface<Extendpoint<TEndpoint, TType>> => {
  //         return new MarvelQuery<Extendpoint<TEndpoint, TType>>({
  //           endpoint: [endpoint[0], endpoint[1], type] as Extendpoint<
  //             TEndpoint,
  //             TType
  //           >,
  //           params,
  //         });
  //       },
  //     };

  //     return {
  //       ...value,
  //       ...additionalProps,
  //     };
  //   })(endpoint);
  // }

  // private extendResourceArray<
  //   V extends Array<ResourceItem>,
  //   BEndpoint extends Endpoint
  // >(value: V, baseEndpoint: BEndpoint) {
  //   if (!value) return value;
  //   return value.map((item) => this.extendResource(item, baseEndpoint));
  // }

  // private extendCollection<V extends List, T extends EndpointType>(
  //   value: V,
  //   baseType: T
  // ) {
  //   const endpoint = createEndpointFromURI(value.collectionURI);

  //   return (<TEndpoint extends Endpoint>(
  //     endpoint: TEndpoint
  //   ): ExtendCollection<TEndpoint, V> => {
  //     const items = value.items.map(
  //       (item) =>
  //         this.extendResource(item, endpoint) as ExtendResourceList<
  //           ResourceEndpoint<TEndpoint>,
  //           V
  //         >[number]
  //     );

  //     const additionalProps: ExtendCollectionProperties<TEndpoint, V> = {
  //       items,
  //       endpoint,
  //       query: (
  //         params: Parameters<TEndpoint> = {} as Parameters<TEndpoint>
  //       ): MarvelQueryInterface<TEndpoint> =>
  //         new MarvelQuery<TEndpoint>({ endpoint, params }),
  //     };

  //     return {
  //       ...value,
  //       ...additionalProps,
  //     };
  //   })(endpoint);
  // }

  /** Validate the parameters of the query, build the URL, send the request and call the onResult function with the results of the request.
   * Then create a MarvelQueryResult with all the properties of the MarvelQuery object,
   * now with the results of the query, and offset adjusted to request the next page of results.
   */
  async fetch(): Promise<MarvelQuery<E>> {
    MarvelQuery.log("Fetching results");
    /** Build the URL of the query with the parameters, keys, timestamp and hash. */
    const url = buildURL(MarvelQuery.apiKeys, this.endpoint, this.params);

    if (this.url === url) {
      throw new Error("Duplicate request");
    }

    this.url = url;

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

      /** Call the onResult function with the results of the request. */
      if (this.onResult) {
        this.onResult(results);
      }

      return this as MarvelQuery<E>;
    } catch (error) {
      console.error("Request error:", error);
      throw new Error("Request error");
    }
  }

  /** Send the request to the API, and validate the response. */
  async request(url: string): Promise<APIWrapper<Result<E>>> {
    MarvelQuery.log(`Requesting: ${url}`);
    try {
      /** Call the onRequest function if it is defined. */
      if (MarvelQuery.config.onRequest) {
        MarvelQuery.config.onRequest(url, this.endpoint.path, this.params);
      }

      const response = await MarvelQuery.config.httpClient<E>(url);

      MarvelQuery.log("Recieved response");

      validateResults(response.data.results, this.endpoint);

      /** Return the response data. */
      return response;
    } catch (error) {
      console.error("Error fetching data from API:", error);
      throw new Error("Failed to fetch data from Marvel API");
    }
  }

  /** Fetch a single result of the query. This will override the parameters to set the limit to 1 and offset to 0 */
  async fetchSingle(): Promise<ExtendResult<E>> {
    MarvelQuery.log("Fetching single result");
    this.params.offset = 0;
    this.params.limit = 1;
    const query = await this.fetch();
    if (!query.results[0]) {
      throw new Error("No result found.");
    }
    return query.results[0];
  }
}
export default MarvelQuery;
export * from "./models/types";