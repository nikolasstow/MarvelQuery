import {
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelResult,
  MarvelSeries,
  MarvelStory,
  ResultMap,
} from "./data-types";
import { APIBaseParams, Params, ParameterMap } from "./param-types";
import { AsEndpoint, Endpoint, EndpointType } from "./endpoint-types";
import { MarvelQueryInstance } from "./interface";

/** The public and private keys for the API. Don't have one? Get one at https://developer.marvel.com/ */
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

export interface ValidationOptions {
  /** Enable/Disable all validators */
  disableAll?: boolean;
  /** Enable/Disable parameter validation */
  parameters?: boolean;
  /** Enable/Disable response validation (returned data) */
  apiResponse?: boolean;
  /** Enable/Disable AutoQuery validation (if AutoQuery injection is turned on) */
  autoQuery?: boolean;
}

/** Arguments for initialization of the API. [Learn More...](configuration.md) */
export interface ConfigOptions<A extends boolean, H extends boolean> {
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
  validation?: ValidationOptions;
  /** By default properties that relate to results of a query are hidden,
   * and the fetch() method returns the instance with those properties now visible.
   * Enable this option to always show these properties. */
  showHiddenProperties: H;
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
  /** Save logs to files. */
  saveToFile?: boolean;
  /** Maximum size of a log file in bytes. */
  maxFileSize?: string;
  /** Maximum number of log files, or number of days with suffx 'd' (ex. "14d" is 14 days) */
  maxFiles?: string;
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
export type HTTPClient = (url: string) => Promise<unknown>;

/**
 * Creates a new instance of the MarvelQuery class.
 *
 * @template T The type of the endpoint or endpoint type.
 * @param endpoint The endpoint to query.
 * @param params Optional parameters for the query.
 * @returns A new instance of MarvelQueryInterface for the specified endpoint.
 */
export type CreateQueryFunction<AQ extends boolean, HP extends boolean> = <
  T extends Endpoint | EndpointType
>(
  endpoint: T,
  params?: Params<AsEndpoint<T>>
) => MarvelQueryInstance<AsEndpoint<T>, AQ, HP>;
