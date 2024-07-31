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
type EndpointResultType<Type extends EndpointType> = Exclude<
  EndpointType,
  Type
>;
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
export type EndpointMap<Value> = Record<EndpointType, Value>;

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

/** Utitility type that determines which type of data being queried.
 * It works by checking the endpoint and looking for the last data type in the endpoint.
 * If the last element is a type, use it. If it's a number, use the type in the first element.
 */
type DataType<ArrayType extends readonly unknown[]> = ArrayType extends [
  ...infer _,
  infer LastElement extends EndpointType
]
  ? LastElement extends number
    ? ArrayType extends [infer FirstElement, ...unknown[]]
      ? FirstElement
      : never
    : LastElement
  : never;

/** Utility type that gets the parameters from the endpoint. */
export type ParamsType<Endpoint extends readonly unknown[]> = Endpoint extends [
  infer First,
  infer Second,
  infer Third
] // Does the Endpoint have three elements?
  ? Third extends EndpointType // Is the third element a data type?
    ? ParameterMap[Third] // The third element is the data type
    : never
  : Endpoint extends [infer First, infer Second] // Does the Endpoint have two elements?
  ? Second extends number // Is the second element a number?
    ? never // No parameters when the endpoint is for an individual item
    : never
  : Endpoint extends [infer First] // Is the endpoint only one element?
  ? First extends EndpointType // Is the element a data type?
    ? ParameterMap[First] // The element is the data type
    : never
  : APIBaseParams;

/** Utility type that gets the result type from the endpoint. */
export type ResultType<Type extends Endpoint> =
  DataType<Type> extends EndpointType ? ResultMap[DataType<Type>] : never;

/** Type of function that will be called when the query is finished, and passes the results as an array. */
export type OnResultFunction<Type extends MarvelResult> = (
  data: Type[]
) => void | Promise<unknown>;

/** A function that will be called when a query of any type is finished, unless overridden with onResult function for a specific type. */
export type AnyResultFunction = OnResultFunction<AnyType>;

/** A union of all data types. */
type AnyType =
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

export interface APIKeys {
  /** Marvel API public key. Don't have one? Get one at https://developer.marvel.com/ */
  publicKey: string;
  /** Marvel API private key. Don't have one? Get one at https://developer.marvel.com/ */
  privateKey: string;
}

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
  /** An optional function that will be called before the request is sent.
   * You can use it to log the request or track the number of requests to the API. */
  onRequest?: (url: string) => void;
  fetchFunction?: (url: string) => Promise<unknown>;
}

/** Response data restructured from the API to create new instance of MarvelQueryResult, extending the MarvelQuery object with the new data and helper functions. */
export type MarvelQueryResults<Type extends Endpoint> = {
  url: string;
  metadata: Metadata;
  responseData: APIResponseData;
  results: ResultType<Type>[];
};
