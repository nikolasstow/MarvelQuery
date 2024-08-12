import {
  MarvelResult,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelStory,
  MarvelSeries,
  APIResponseData,
  Metadata,
  APIWrapper,
  List,
  ComicList,
  CharacterList,
  CreatorList,
  EventList,
  StoryList,
  SeriesList,
} from "./data-types";
import {
  ComicParams,
  CharacterParams,
  CreatorParams,
  EventParams,
  StoryParams,
  SeriesParams,
  APIBaseParams,
} from "./param-types";

/** The endpoint contains up to three elements. A type, a Marvel ID, and another type.
 * This follows the same pattern as the URI/URL string, but split into an array by slashes.
 ** For example,
 *  http://gateway.marvel.com/v1/public/comics/              becomes ['comics']
 *  http://gateway.marvel.com/v1/public/comics/108992/events becomes ['comics', 108992, 'events']
 *
 ** The first element is the type of the subject of your query.
 * For example, if you are searching for a comic or comics, the first element is 'comics'.
 * The same goes for characters, creators, events, series and stories.
 ** The second element is the ID of the subject of your query.
 * With an id you can query a specific item from the API.
 ** The third element is the type of results you want back for the subject of your query.
 * If you are querying for events that feature the subject of your query, the third element is 'events'.
 * The same applies for stories or characters featured in a comic.
 * For example if you are looking for events in which Spider-Man appeared,
 * your query endpoint would be ['characters', '1009491', events']
 */
export type Endpoint = DistinctEndpointType<
  [EndpointType, number?, EndpointType?]
>;
/** The data types of the endpoints: 'comics', 'characters', 'creators', 'events', 'series', 'stories' */
export type EndpointType = keyof ParameterMap;
/** Utility type that removes the passed type from the available endpoint types */
type EndpointResultType<T extends EndpointType> = Exclude<EndpointType, T>;
/** Utility type that infers the type of the first element of the endpoint, so it can be passed to the EndpointResultType.
 * This removes the type of the first element from the available endpoint types for the last element, ensuring they do not match.
 */
type DistinctEndpointType<E extends [EndpointType, number?, EndpointType?]> =
  E extends [infer First, number?, EndpointType?]
    ? First extends EndpointType
      ? [First, number?, EndpointResultType<First>?]
      : ["Error: First type must be a valid EndpointType", First]
    : never;

/** Create a map of any data type with the endpoint as the key. */
export type EndpointMap<V> = Record<EndpointType, V>;

/** A map of parameters to their corresponding types providing type safety. */
export type ParameterMap = {
  comics: ComicParams;
  characters: CharacterParams;
  creators: CreatorParams;
  events: EventParams;
  stories: StoryParams;
  series: SeriesParams;
};

/** A map of results to their corresponding types providing type safety. */
export type ResultMap = {
  comics: MarvelComic;
  characters: MarvelCharacter;
  creators: MarvelCreator;
  events: MarvelEvent;
  stories: MarvelStory;
  series: MarvelSeries;
};

// export type LoadedState = () => Promise<any>; // Replace with actual return type

export interface StateMap<E extends Endpoint> {
  init: never;
  loaded: ExtendQuery<E>;
}

export type InitQuery<E extends Endpoint> = {
  endpoint: E;
  params: Parameters<E>;
};

export type StateTypes<E extends Endpoint> = keyof StateMap<E>;

export type MarvelQueryInterface<
  E extends Endpoint,
  Type extends StateTypes<E>
> = {
  query: StateMap<E>[Type];

  /** Endpoint of the query
   * @example http://gateway.marvel.com/v1/public/characters/1009491/comics
   * becomes ["characters", 1009491, "comics"]
   */
  endpoint: E;
  /** Parameters of the query */
  params: Parameters<E>;
  /** The data type of the results of the query */
  type: EndpointType;

  /** The URL of the query
   * @example ```https://gateway.marvel.com/v1/public/characters?apikey=5379d18afd202d5c4bba6b58417240fb&ts=171234567391456&hash=2270ae1a72023bdf71235da7fdbf2352&offset=0&limit=100&name=Peter+Parker```
   */
  url: string;
  /** The number of results returned by the query. */
  count: number;
  /** The total number of results available for the query. */
  total: number;
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
  result: ExtendResult<E> | undefined;
  /** The results of the query. */
  results: ExtendResult<E>[];
  /** The conjunction of all results from this query instance. */
  resultHistory: ExtendResult<E>[];

  /** The query is complete when all results have been fetched. */
  isComplete: boolean;

  /** Validate the parameters of the query, build the URL, send the request and call the onResult function with the results of the request.
   * Then create a MarvelQueryResult with all the properties of the MarvelQuery object,
   * now with the results of the query, and offset adjusted to request the next page of results.
   */
  fetch(): Promise<MarvelQueryInterface<E, "loaded">>;
  /** Build the URL of the query with the parameters, timestamp and hash. */
  buildURL(): string;
  /** Send the request to the API, and validate the response. */
  request(url: string): Promise<APIWrapper<Result<E>>>;
  /** Fetch a single result of the query. This will override the parameters to set the limit to 1 and offset to 0 */
  fetchSingle(): Promise<MarvelQueryInterface<E, "loaded">>;
};

/** Utitility type that determines which type of data being queried.
 * It works by checking the endpoint and looking for the last data type in the endpoint.
 * If the last element is a type, use it. If it's a number, use the type in the first element.
 */
type DataType<E extends readonly unknown[]> = E extends [
  ...infer _,
  infer LastElement extends EndpointType
]
  ? LastElement extends number
    ? E extends [infer FirstElement, ...unknown[]]
      ? FirstElement
      : never
    : LastElement
  : never;

/** Utility type that gets the parameters from the endpoint. */
export type Parameters<E extends readonly unknown[]> = E extends [
  infer First,
  infer Second,
  infer Third
] // Does the Endpoint have three elements?
  ? Third extends EndpointType // Is the third element a data type?
    ? ParameterMap[Third] // The third element is the data type
    : never
  : E extends [infer First, infer Second] // Does the Endpoint have two elements?
  ? Second extends number // Is the second element a number?
    ? never // No parameters when the endpoint is for an individual item
    : never
  : E extends [infer First] // Is the endpoint only one element?
  ? First extends EndpointType // Is the element a data type?
    ? ParameterMap[First] // The element is the data type
    : never
  : APIBaseParams;

export type Extendpoint<E extends Endpoint, T extends EndpointType> = [
  E[0],
  number,
  T
] extends Endpoint
  ? [E[0], number, T]
  : never;

/** Utility type that gets the result type from the endpoint. */
export type Result<E extends Endpoint> = DataType<E> extends EndpointType
  ? ResultMap[DataType<E>]
  : never;

/** Type of function that will be called when the query is finished, and passes the results as an array. */
export type OnResultFunction<R extends MarvelResult> = (
  data: R[]
) => void | Promise<unknown>;

/** A function that will be called when a query of any type is finished, unless overridden with onResult function for a specific type. */
export type AnyResultFunction = OnResultFunction<AnyType>;

/** A union of all data types. */
export type AnyType =
  | MarvelComic
  | MarvelCharacter
  | MarvelCreator
  | MarvelEvent
  | MarvelSeries
  | MarvelStory;

export type AnyParams =
  | APIBaseParams
  | ComicParams
  | CharacterParams
  | CreatorParams
  | EventParams
  | StoryParams
  | SeriesParams
  | undefined;

/** A map of functions, one for each result type, as well as 'any' to be called when the query is finished */
export type OnResultMap = {
  [K in EndpointType]?: OnResultFunction<ResultMap[K]>;
} & {
  any?: AnyResultFunction;
};

/** Global parameters, 'all' parameters are applied to all queries of any type unless overridden.
 * You can also apply global parameters to specific data types (comics, characters, events, etc.)
 */
export interface GlobalParams extends Partial<ParameterMap> {
  all?: APIBaseParams;
}

export type OnRequestFunction = (
  url: string,
  endpoint: Endpoint,
  params: Record<string, unknown>
) => void;

export interface APIKeys {
  /** Marvel API public key. Don't have one? Get one at https://developer.marvel.com/ */
  publicKey: string;
  /** Marvel API private key. Don't have one? Get one at https://developer.marvel.com/ */
  privateKey: string;
}

/** Replace the default fetch function with a custom one.  */
export type HTTPClient = <E extends Endpoint>(
  url: string
) => Promise<APIWrapper<Result<E>>>;
/** Arguments for initialization of the API */
export interface Config {
  // Options
  /** Global parameters to be applied to all queries, or all queries of a specific type.
   * @example ```globalParams: {
   * all: { limit: 10 },
   * comics: { noVariants: true }
   * }```
   */
  globalParams?: GlobalParams;
  /** Remove undefined parameters from the query */
  omitUndefined?: boolean; // set to true (by default) this will remove undefined values from the query
  /** Enable verbose logging. */
  verbose?: boolean;
  /** An optional function that will be called before the request is sent.
   * You can use it to log the request or track the number of requests to the API. */
  onRequest?: OnRequestFunction;
  // Functions
  /** Add custom functions to be called when a request of a specific type is complete.
   * @example ```onResult: {
   * comics: (items) => {
   *   items.map((comic) => {
   *     console.log("Saving comic:", comic.title);
   *   });
   * }
   * }```
   */
  onResult?: OnResultMap;
  /** Replace the default http client (axios) with your own http client.  */
  httpClient?: HTTPClient;
}
export type ResourceObject = {
  resourceURI: string;
} & { [key: string]: any };
export type ExtendedResourceObject<
  E extends Endpoint,
  I extends ResourceObject
> = WithQueryAndEndpoint<E, I>;
// The type project
export type Modify<T, M> = Omit<T, keyof M> & M;

export type WithQueryAndEndpoint<E extends Endpoint, T> = T & ExtendResource<E>;
// Helper type to check if a type includes 'resourceURI'

export type HasResourceURI<T> = T extends { resourceURI: string }
  ? true
  : false;
// Helper type to check if a type includes 'collectionURI'
export type HasCollectionURI<T> = T extends { collectionURI: string }
  ? true
  : false;
export type ResourceList<T> = T extends { items: Array<infer List> }
  ? Modify<
      T,
      {
        items: Array<List & ExtendResource>;
      }
    >
  : never;
export type ExtendCollection<T extends Endpoint = Endpoint> =
  ExtensionProperties<QueryCollection<T>>;

export type ExtendResource<T extends Endpoint = Endpoint> = ExtensionProperties<
  ExtendQuery<T>
>;

// export type ExtendResultItem<T extends Endpoint = Endpoint> =
//   ExtensionProperties<ExtendQuery<T>>;

export type ExtensionProperties<Q> = {
  endpoint: Endpoint;
  query: Q;
  fetch?: () => Promise<void>;
};

type NoSameEndpointType<T extends EndpointType> = Exclude<EndpointType, T>;

export type ExtendQuery<TEndpoint extends Endpoint> = <
  TType extends NoSameEndpointType<TEndpoint[0]>
>(
  type: TType,
  params: Parameters<[TType]>
) => InitializedQuery<TEndpoint>;

// export type ExtendResultQuery<TEndpoint extends Endpoint> = <
//   TType extends EndpointType
// >(
//   type: TType,
//   params: Parameters<Extendpoint<TEndpoint, TType>>
// ) => InitializedQuery<TEndpoint>;

export type QueryCollection<E extends Endpoint> = (
  params: Parameters<E>
) => InitializedQuery<E>;

export type InitializedQuery<E extends Endpoint> = MarvelQueryInterface<
  E,
  "init"
>;

export type ExtendType<T extends AnyType> = {
  [K in keyof T]: [K] extends Endpoint // If the key is an endpoint
    ? HasResourceURI<T[K]> extends true
      ? T[K] & ExtendResource<[K]>
      : HasCollectionURI<T[K]> extends true
      ? ResourceList<T[K]> & ExtendCollection<[K]>
      : T[K]
    : T[K];
};

export type ExtendResult<E extends Endpoint> = ExtendType<Result<E>> &
  ExtendResource<E>;
/** Type of the query function. */
