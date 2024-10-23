import { Metadata, APIWrapper, APIResult } from "./data-types";
import { Result } from "./autoquery-types";
import { Params } from "./param-types";
import { Endpoint } from "./endpoint-types";

export interface MarvelQueryInit<E extends Endpoint, AQ extends boolean> {
  /** Specifies whether AutoQuery is enabled, allowing additional queries to be made on the result items. */
  autoQuery: boolean;
  /** A unique identifier for the query, used for logging and tracking. */
  queryId: string;
  /** Contains the endpoint path (a tuple, e.g., ["comics", 1234]) and the data type (e.g., "comics"),
   * defining the target location for the API request and the type of data being queried.
   * @example http://gateway.marvel.com/v1/public/characters/1009491/comics
   * becomes ["characters", 1009491, "comics"]
   */
  endpoint: E;
  /** The query parameters used to refine the API request. */
  params: Params<E>;
  /** Constructs the full URL for the API request using keys, the endpoint, and query parameters. */
  buildURL(): string;
  /** Executes the query and returns a `MarvelQueryFetched` instance with the results and the
   * offset adjusted to request the next page of results.
   */
  fetch(): Promise<MarvelQueryFetched<E, AQ>>;
  /** Fetches a single result, overriding parameters to set the limit to 1 and offset to 0. */
  fetchSingle(): Promise<Result<E, AQ>>;
  /** Sends the API request to the Marvel API and validates the response data. */
  request(url: string): Promise<APIWrapper<APIResult<E>>>;
  /** Indicates whether the query parameters have been validated.
   * Contains only the parameters key. Values can be undefined, true (valid), or false (invalid). */
  validated: {
    parameters: boolean | undefined;
  };
  /** Indicates whether all possible results have been fetched. If true, there are no more pages of data to retrieve. */
  isComplete: boolean;
}

export interface MarvelQueryFetched<E extends Endpoint, AQ extends boolean>
  extends MarvelQueryInit<E, AQ> {
  /** The complete URL used to make the API request, including all parameters and authentication. */
  url: string;
  /** The starting position for the current set of results, used for paginating through larger datasets. */
  offset: number;
  /** The maximum number of results returned per request, as specified in the query parameters (max: 100). */
  limit: number;
  /** The total number of results available for the entire query across all pages. */
  total: number;
  /** The number of results returned in the current request. */
  count: number;
  /** Information about the API response, including status codes, attribution requirements, and other details.
   * @property code: The HTTP status code of the returned result.
   * @property status: A string description of the call status.
   * @property copyright: The copyright notice for the returned result.
   * @property attributionText: The attribution notice for this result. Please display either this notice or the contents of the attributionHTML field on all screens which contain data from the Marvel Comics API.
   * @property attributionHTML: An HTML representation of the attribution notice for this result. Please display either this notice or the contents of the attributionText field on all screens which contain data from the Marvel Comics API.
   * @property etag: A digest value of the content returned by the call.
   */
  metadata: Metadata;
  /** The list of results returned for the current query request. */
  results: Result<E, AQ>[];
  /** The cumulative list of results from all previous requests made for this query. */
  resultHistory: Result<E, AQ>[];
  /** Adds results and autoQuery keys, along with parameters, to track validation. Values can be undefined, true (valid), or false (invalid). */
  validated: {
    parameters: boolean | undefined;
    results: boolean | undefined;
    autoQuery: boolean | undefined;
  };
}

export type MarvelQueryInstance<
  E extends Endpoint,
  AQ extends boolean,
  HP extends boolean
> = HP extends true ? MarvelQueryFetched<E, AQ> : MarvelQueryInit<E, AQ>;
