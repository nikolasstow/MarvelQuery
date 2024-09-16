import {
  APIWrapper,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelResult,
  MarvelSeries,
  MarvelStory,
} from "./data-types";
import { APIBaseParams, Parameters } from "./param-types";
import { ResultMap } from "./data-types";
import { ParameterMap } from "./param-types";
import { Result } from "./data-types";
import { AsEndpoint, Endpoint, EndpointType } from "./endpoint-types";
import { MarvelQueryInterface } from "./interface";

/** The public and private keys for the API. */
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
  globalParams: GlobalParams;
  /** Remove undefined parameters from the query */
  omitUndefined: boolean; // set to true (by default) this will remove undefined values from the query

  /** Enable verbose logging. */
  verbose: boolean;
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
  consoleCharLimit?: number; // Maximum number of characters to print in the console
  /** Replace the default http client (axios) with your own http client.  */
  httpClient: HTTPClient;
}

/** Global parameters, 'all' parameters are applied to all queries of any type unless overridden.
 * You can also apply global parameters to specific data types (comics, characters, events, etc.)
 */
interface GlobalParams extends Partial<ParameterMap> {
  all?: APIBaseParams;
}

/** Function type that is invoked for each request made. */
export type OnRequestFunction = (
  url: string,
  endpoint: Endpoint,
  params: Record<string, unknown>
) => void;

/** A map of functions, one for each result type, as well as 'any' to be called when the query is finished */
export type OnResultMap = {
  [K in EndpointType]?: OnResultFunction<ResultMap[K]>;
} & {
  any?: AnyResultFunction;
};

/**
 * A function that is called when a query of a specific type is finished.
 * @param data - The results of the query.
 * @returns A promise that resolves when the query is finished.
 */
export type OnResultFunction<R extends MarvelResult> = (
  data: R[]
) => void | Promise<unknown>;

/**
 * A function that is called when a query of any type is finished.
 * @param data - The results of the query.
 * @returns A promise that resolves when the query is finished.
 */
export type AnyResultFunction = OnResultFunction<
  | MarvelComic
  | MarvelCharacter
  | MarvelCreator
  | MarvelEvent
  | MarvelSeries
  | MarvelStory
>;

/** Replace the default HTTP client with one of your choosing. */
export type HTTPClient = <E extends Endpoint>(
  url: string
) => Promise<APIWrapper<Result<E>>>;

/**
 * Creates a new instance of the MarvelQuery class.
 *
 * @template T The type of the endpoint or endpoint type.
 * @param endpoint The endpoint to query.
 * @param params Optional parameters for the query.
 * @returns A new instance of MarvelQueryInterface for the specified endpoint.
 */
export type CreateQueryFunction = <T extends Endpoint | EndpointType>(
  endpoint: T,
  params?: Parameters<AsEndpoint<T>>
) => MarvelQueryInterface<AsEndpoint<T>>