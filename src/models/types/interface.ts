import { Metadata, APIResponseData, APIWrapper } from "./data-types";
import { ExtendResult, Result } from "./autoquery-types";
import { APIResult } from "./data-types";
import { Params } from "./param-types";
import { Endpoint } from "./endpoint-types";
import { EndpointDescriptor } from "./endpoint-types";

export interface MarvelQueryInit<E extends Endpoint, AQ extends boolean> {
  autoQuery: boolean;
  /** Query identifier for logging */
  queryId: string;
  /** Endpoint of the query
   * @example http://gateway.marvel.com/v1/public/characters/1009491/comics
   * becomes ["characters", 1009491, "comics"]
   */
  endpoint: EndpointDescriptor<E>;
  /** Parameters of the query */
  params: Params<E>;
  /** Generates a url using the api keys, the endpoint, and parameters */
  buildURL(): string;
  /** Validate the parameters of the query, build the URL, send the request and call the onResult function with the results of the request.
   * Then create a MarvelQueryResult with all the properties of the MarvelQuery object,
   * now with the results of the query, and offset adjusted to request the next page of results.
   */
  fetch(): Promise<MarvelQueryFetched<E, AQ>>;
  /** Send the request to the API, and validate the response. */
  request(url: string): Promise<APIWrapper<APIResult<E>>>;
  /** Fetch a single result of the query. This will override the parameters to set the limit to 1 and offset to 0 */
  fetchSingle(): Promise<Result<E, AQ>>;
  /** Validation success/failures */
  validated: {
    parameters: boolean | undefined;
  };

  /** The query is complete when all results have been fetched. */
  isComplete: boolean;
}

export interface MarvelQueryFetched<E extends Endpoint, AQ extends boolean>
  extends MarvelQueryInit<E, AQ> {
  /** The URL of the query
   * @example ```https://gateway.marvel.com/v1/public/characters?apikey=5379d18afd202d5c4bba6b58417240fb&ts=171234567391456&hash=2270ae1a72023bdf71235da7fdbf2352&offset=0&limit=100&name=Peter+Parker```
   */
  url: string;
  /** The offset for the query results, used for pagination. */
  offset: number;
  /** The limit for the number of results returned by the query. */
  limit: number;
  /** The total number of results available for the query. */
  total: number;
  /** The number of results returned by the query. */
  count: number;
  /** Metadata included in the API response.
   * @property code: The HTTP status code of the returned result.
   * @property status: A string description of the call status.
   * @property copyright: The copyright notice for the returned result.
   * @property attributionText: The attribution notice for this result. Please display either this notice or the contents of the attributionHTML field on all screens which contain data from the Marvel Comics API.
   * @property attributionHTML: An HTML representation of the attribution notice for this result. Please display either this notice or the contents of the attributionText field on all screens which contain data from the Marvel Comics API.
   * @property etag: A digest value of the content returned by the call.
   */
  metadata: Metadata;
  /** The results of the query. */
  results: Result<E, AQ>[];
  /** The conjunction of all results from this query instance. */
  resultHistory: Result<E, AQ>[];
  /** Validation success/failures */
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
