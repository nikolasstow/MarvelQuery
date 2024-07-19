import * as params from './param-types';
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
} from './data-types';

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
export type Endpoint = [EndpointType, number?, EndpointType?];
/** The data types of the endpoints: 'comics', 'characters', 'creators', 'events', 'series', 'stories' */
export type EndpointType = keyof ParameterMap;
/** Create a map of any data type with the endpoint as the key. */
export type EndpointMap<Value> = Record<EndpointType, Value>;

/** A map of parameters to their corresponding types providing type safety. */
export type ParameterMap = {
  comics: params.Comics;
  characters: params.Characters;
  creators: params.Creators;
  events: params.Events;
  stories: params.Stories;
  series: params.Series;
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
  infer LastElement
]
  ? LastElement extends number
    ? ArrayType extends [infer FirstElement, ...unknown[]]
      ? FirstElement
      : never
    : LastElement
  : never;

/** Utility type that gets the parameters from the endpoint. */
export type ParamsType<Type extends Endpoint> =
  DataType<Type> extends EndpointType
    ? ParameterMap[DataType<Type>]
    : params.APIBase;

/** Parameters for a specific endpoint */
export type ExtendEndpointParams<Key extends EndpointType> = ParameterMap[Key];

/** Required parameters for any query, if not specified the default will be used. */
type BaseParams = Required<Pick<params.APIBase, 'limit' | 'offset'>>;

/** Utility type for parameters with limit and offset removed. */
type CleanParams<Type extends Endpoint> = Omit<
  ParamsType<Type>,
  keyof BaseParams
>;

/** Utility type that forces limnit and offset to be required. */
export type Parameters<Type extends Endpoint> = CleanParams<Type> & BaseParams;

/** Utility type that gets the result type from the endpoint. */
export type ResultType<Type extends Endpoint> =
  DataType<Type> extends EndpointType ? ResultMap[DataType<Type>] : never;

/** Type of function that will be called when the query is finished, arguments are the results */
export type OnResultFunction<Type extends MarvelResult> = (
  data: Type[]
) => void | Promise<unknown>;

/** A function that will be called when a query of any type is finished, unless overridden with onResult function for a specific type. */
export type AnyResultFunction = OnResultFunction<MarvelComic | MarvelCharacter | MarvelCreator | MarvelEvent | MarvelSeries | MarvelStory>;

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
  all?: params.APIBase;
}

/** Arguments for initialization of the API */
export interface InitArgs {
  /** Marvel API public key. Don't have one? Get one at https://developer.marvel.com/ */
  publicKey: string;
  /** Marvel API private key. Don't have one? Get one at https://developer.marvel.com/ */
  privateKey: string;
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
};

/** Response data restructured from the API to create new instance of MarvelQueryResult, extending the MarvelQuery object with the new data and helper functions. */
export type MarvelQueryResults<Type extends Endpoint> = {
  url: string;
  metadata: Metadata;
  responseData: APIResponseData;
  results: ResultType<Type>[];
};
