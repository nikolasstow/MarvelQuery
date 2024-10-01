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
import { APIBaseParams, Params } from "./param-types";
import { ResultMap } from "./data-types";
import { ParameterMap } from "./param-types";
import { APIResult } from "./data-types";
import { AsEndpoint, Endpoint, EndpointType } from "./endpoint-types";
import { MarvelQueryInstance } from "./interface";

/** The public and private keys for the API. */
export interface APIKeys {
  /** Marvel API public key. Don't have one? Get one at https://developer.marvel.com/ */
  publicKey: string;
  /** Marvel API private key. Don't have one? Get one at https://developer.marvel.com/ */
  privateKey: string;
}

export type EnableAutoQuery = true;
export type DisableAutoQuery = false;
export type ShowHiddenProperties = true;

export type Config = ConfigOptions<boolean, boolean>;

/** Arguments for initialization of the API */
export interface ConfigOptions<A extends boolean, H extends boolean> {
  /** By default properties that relate to results of a query are hidden, 
   * and the fetch() method returns the instance with those properties now visible.
   * Enable this option to always show these properties. */
  showHiddenProperties: H;
  /** Is AutoQuery Enabled? */
  autoQuery: A;
  /** Global parameters to be applied to all queries, or all queries of a specific type.
   * @example ```globalParams: {
   * all: { limit: 10 },
   * comics: { noVariants: true }
   * }```
   */
  globalParams: GlobalParams;
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
  /** Logging options */
  logOptions?: LogOptions;
  /** Replace the default http client (axios) with your own http client.  */
  httpClient: HTTPClient;
  /** Flag for test enviroment */
  isTestEnv?: boolean;
  /** Enable/Disable all or some validators (all enabled by default) */
  validation?: {
    /** Enable/Disable all validators */
    disableAll?: boolean;
    /** Enable/Disable parameter validation */
    parameters?: boolean;
    /** Enable/Disable response validation (returned data) */
    apiResponse?: boolean;
    /** Enable/Disable AutoQuery validation (if AutoQuery injection is turned on) */
    autoQuery?: boolean;
  };
}

/** Global parameters, 'all' parameters are applied to all queries of any type unless overridden.
 * You can also apply global parameters to specific data types (comics, characters, events, etc.)
 */
export interface GlobalParams extends Partial<ParameterMap> {
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

export interface LogOptions {
  /** Enable verbose logging. */
  verbose?: boolean;
  /** Maximum number of lines in a log message. */
  maxLines?: number;
  /** Maximum length of a line in a log message. */
  maxLineLength?: number;
}

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
) => Promise<APIWrapper<APIResult<E>>>;

/**
 * Creates a new instance of the MarvelQuery class.
 *
 * @template T The type of the endpoint or endpoint type.
 * @param endpoint The endpoint to query.
 * @param params Optional parameters for the query.
 * @returns A new instance of MarvelQueryInterface for the specified endpoint.
 */
export type CreateQueryFunction<AQ extends boolean, HP extends boolean> = <T extends Endpoint | EndpointType>(
  endpoint: T,
  params?: Params<AsEndpoint<T>>
) => MarvelQueryInstance<AsEndpoint<T>, AQ, HP>