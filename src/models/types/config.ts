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
import { Endpoint, EndpointType } from "./endpoint-types";

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
/** Replace the default fetch function with a custom one.  */

export type HTTPClient = <E extends Endpoint>(
  url: string
) => Promise<APIWrapper<Result<E>>>;

export interface APIKeys {
  /** Marvel API public key. Don't have one? Get one at https://developer.marvel.com/ */
  publicKey: string;
  /** Marvel API private key. Don't have one? Get one at https://developer.marvel.com/ */
  privateKey: string;
}

export interface EndpointDescriptor<E extends Endpoint> {
  path: E;
  type: DataType<E>;
}
