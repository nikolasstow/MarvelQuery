import { APIWrapper } from "./data-types";
import { APIBaseParams } from "./param-types";
import {
  ParameterMap,
  AnyResultFunction,
  OnResultFunction,
  ResultMap,
  Result,
  DataType,
} from "./utility-types";
import { Endpoint, EndpointType } from "./endpoint";
import winston from "winston";

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

export interface GlobalParams extends Partial<ParameterMap> {
  all?: APIBaseParams;
}
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

export interface APIKeys {
  /** Marvel API public key. Don't have one? Get one at https://developer.marvel.com/ */
  publicKey: string;
  /** Marvel API private key. Don't have one? Get one at https://developer.marvel.com/ */
  privateKey: string;
}

export type HTTPClient = <E extends Endpoint>(
  url: string
) => Promise<APIWrapper<Result<E>>>;

export interface EndpointDescriptor<E extends Endpoint> {
  path: E;
  type: DataType<E>;
}

/**
 * Interface for the performance timer object.
 * This object holds the start time and a stop function to calculate the duration.
 */
export interface PerformanceTimer {
  /** The start time of the performance measurement, in milliseconds. */
  startTime: number;
  
  /**
   * Stops the performance timer and logs the duration.
   * @param message Optional message to include when logging the stop time.
   * @returns The duration between the start and stop time, in milliseconds.
   */
  stop: (message?: string) => number;
}

/**
 * Interface for the custom logger that extends Winston's Logger.
 * Adds custom methods for performance timing, verbosity control, and file-only logging.
 */
export interface CustomLogger extends winston.Logger {
  /** Path to the log file used by the logger. */
  logFilePath: string;
  
  /** 
   * Starts a performance timer and returns a timer object.
   * @param message Optional message to log when the timer starts.
   * @param logger Optional custom logger instance to use for logging.
   * @returns The performance timer object.
   */
  performance: (message?: string, logger?: CustomLogger) => PerformanceTimer;
  
  /**
   * Decorator function to measure the performance of a class method.
   * @param target The class the method belongs to.
   * @param key The name of the method.
   * @param descriptor Method descriptor object.
   */
  measurePerformance: (
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<any>
  ) => void;
  
  /**
   * Enables or disables verbose logging.
   * @param verbose Boolean indicating whether verbose logging should be enabled.
   */
  setVerbose: (verbose: boolean) => void;
  
  /** Whether verbose logging is currently enabled. */
  verboseStatus: boolean;
  
  /**
   * Logs a message only to the log file, bypassing the console.
   * @param message The message to log.
   */
  fileOnly: (message: string) => void;
  
  /**
   * Creates a child logger instance identified by the provided ID.
   * @param id A unique identifier to distinguish the logger.
   * @returns A new logger instance with the provided ID attached.
   */
  identify: (id: string) => CustomLogger;
}