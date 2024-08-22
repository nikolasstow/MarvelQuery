import { ParameterMap, AnyType, ResultMap, DataType } from "./utility-types";

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
// export type EndpointType = keyof ParameterMap;
export type EndpointType =
  | "comics"
  | "characters"
  | "creators"
  | "events"
  | "series"
  | "stories";
/** Utility type that removes the passed type from the available endpoint types */
type ExcludeEndpointType<T extends EndpointType> = Exclude<EndpointType, T>;
/** Utility type that infers the type of the first element of the endpoint, so it can be passed to the EndpointResultType.
 * This removes the type of the first element from the available endpoint types for the last element, ensuring they do not match.
 */
export type DistinctEndpointType<
  E extends [EndpointType, number?, EndpointType?]
> = E extends [infer First, number?, EndpointType?]
  ? First extends EndpointType
    ? [First, number?, ExcludeEndpointType<First>?]
    : [
        "endpoint-types.ts DistinctEndpointType",
        "Error: First type must be a valid EndpointType",
        First
      ]
  : never;
// Preferable

// export type Extendpoint<E extends Endpoint, T extends EndpointType> = [
//   E[0],
//   number,
//   T
// ] extends Endpoint ? [E[0], number, T] : ["Error, could not extend endpoint", T];

export type Extendpoint<
  E extends Endpoint,
  T extends EndpointType
> = DataType<E> extends EndpointType
  ? NewEndpoint<E, T> extends Endpoint
    ? NewEndpoint<E, T>
    : DataType<E> extends T
    ? IDEndpoint<E> extends Endpoint
      ? IDEndpoint<E>
      : never
    : never
  : never;
// export type UniqueEndpoint<B extends EndpointType, >
export type NewEndpoint<E, T> = [DataType<E>, number, T];
export type IDEndpoint<E> = [DataType<E>, number];
export type ResourceEndpoint<E> = IDEndpoint<E> extends Endpoint
  ? IDEndpoint<E>
  : never;
export type NoSameEndpointType<E extends Endpoint> = Exclude<
  EndpointType,
  DataType<E>
>;
/** Create a map of any data type with the endpoint as the key. */

export type EndpointMap<V> = Record<EndpointType, V>;

export type KeyEndpointMap = Record<string, EndpointType>;
export type BaseEndpoint<E> = [DataType<E>];
export type EndpointTyped<T extends EndpointType> = [T] extends Endpoint
  ? [T]
  : never;

// export type ExtendedResultEndpointMap = {
//   [K in keyof ResultMap]: KeyEndpointMap<ResultMap[K]>;
// };
type BaseEndpointOptions<T extends EndpointType> = {
  [K in ExcludeEndpointType<T>]: [K];
}[ExcludeEndpointType<T>];
export type ExtendedQueryResult<T extends EndpointType> = NewEndpoint<
  BaseEndpointOptions<T>,
  T
> extends Endpoint
  ? NewEndpoint<BaseEndpointOptions<T>, T>
  : never;

export type IsEndpoint<T> = T extends Endpoint ? T : never;