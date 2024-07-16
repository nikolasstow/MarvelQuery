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
 ** The element is the type of results you want back for the subject of your query.
 * If you are querying for events that feature the subject of your query, the third element is 'events'. 
 * The same applies for stories or characters featured in a comic.
 * For example if you are looking for events in which Spider-Man appeared, 
 * your query endpoint would be ['characters', '1009491', events']
 */
export type Endpoint = [EndpointType, number?, EndpointType?];
export type EndpointType = keyof ParameterMap;
export type EndpointMap<Value> = Record<EndpointType, Value>;

// A map of parameters to their corresponding types providing type safety.
export type ParameterMap = {
  comics: params.Comics;
  characters: params.Characters;
  creators: params.Creators;
  events: params.Events;
  stories: params.Stories;
  series: params.Series;
};

// A map of results to their corresponding types providing type safety.
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

// After the type is determined, get the corresponding type from the ParameterMap
export type ParamsType<Type extends Endpoint> =
  DataType<Type> extends EndpointType
    ? ParameterMap[DataType<Type>]
    : params.APIBase;

// Parameters for a specific type of data within the endpoint
export type ExtendEndpointParams<Key extends EndpointType> = ParameterMap[Key];

// Get the limit and offset from the parameters from APIBase
type BaseParams = Required<Pick<params.APIBase, 'limit' | 'offset'>>;

// Remove the BaseParams so we can add them back as required
type CleanParams<Type extends Endpoint> = Omit<
  ParamsType<Type>,
  keyof BaseParams
>;

// Makes BaseParams' properties (limit, offset, orderBy, modifiedSince) all required
export type Parameters<Type extends Endpoint> = CleanParams<Type> & BaseParams;

// Just like ParamsType, get the corresponding type from the ResultMap
export type ResultType<Type extends Endpoint> =
  DataType<Type> extends EndpointType ? ResultMap[DataType<Type>] : never;

// Type of function that will be called when the query is finished, arguments are the results
export type OnResultFunction<Type extends MarvelResult> = (
  data: Type[]
) => void | Promise<unknown>;

// A map of functions, one for each result type, to be called when the query is finished
export type OnResultMap = {
  [K in EndpointType]?: OnResultFunction<ResultMap[K]>;
};

// Global Parameters
export interface GlobalParams extends Partial<ParameterMap> {
  all?: params.APIBase;
}

// Arguments for the init function
export type InitArgs = {
  publicKey: string;
  privateKey: string;
  // Options
  globalParams?: GlobalParams;
  omitThe?: boolean; // set to true this will remove the "the" from the beginning of the title
  omitUndefined?: boolean; // set to true (by default) this will remove undefined values from the query
  // Functions
  onResult?: OnResultMap;
  onRequest?: (url: string) => void;
  fetchFunction?: (url: string) => Promise<unknown>;
};

export type MarvelQueryResults<Type extends Endpoint> = {
  url: string;
  metadata: Metadata;
  responseData: APIResponseData;
  results: ResultType<Type>[];
};
