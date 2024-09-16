import { DataType } from "./data-types";

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
export type Endpoint = [EndpointType, number?, EndpointType?] extends [
  // Shape of the endpoint
  infer First,
  number?,
  EndpointType?
]
  ? First extends EndpointType // Verify if the first element is an EndpointType
    ? [First, number?, ExcludeEndpointType<First>?] // Remove the type of the first element from the available endpoint types for the last element
    : never
  : never;

/** The data types of the endpoints: 'comics', 'characters', 'creators', 'events', 'series', 'stories' */
export type EndpointType =
  | "comics"
  | "characters"
  | "creators"
  | "events"
  | "series"
  | "stories";

/** Verifies if T is an Endpoint */
export type IsEndpoint<T> = T extends Endpoint ? T : never;

/** Verifies if T is an EndpointType */
export type IsEndpointType<T> = T extends EndpointType ? T : never;

/** Converts an EndpointType to an Endpoint and is used in createQuery function so that Endpoints
 * can be written as "comics" instead of ["comics"], reducing boilerplate */
export type EndpointFromType<T extends EndpointType> = IsEndpoint<[T]>;

/** Accepts an Endpoint or an EndpointType and returns an Endpoint */
export type AsEndpoint<T extends Endpoint | EndpointType> = T extends Endpoint
  ? T
  : EndpointFromType<IsEndpointType<T>>;

/** Create a new endpoint from an existing one and a new type */
export type NewEndpoint<E, T> = IsEndpoint<[DataType<E>, number, T]>;

/** Endpoint for a specific resource */
export type ResourceEndpoint<E> = IsEndpoint<[DataType<E>, number]>;

/** Endpoint for a collection */
export type CollectionEndpoint<E extends Endpoint, T> = NewEndpoint<E, T>;

/** Utility type that removes the passed type from the available endpoint types */
export type ExcludeEndpointType<T extends EndpointType> = Exclude<
  EndpointType,
  T
>;

/** A map of endpoint types to any type */
export type EndpointMap<V> = Record<EndpointType, V>;

/** Creates a new endpoint from an existing one and a new type */
export type Extendpoint<
  E extends Endpoint,
  T extends EndpointType
> = DataType<E> extends T // If the type of the existing endpoint is the same as the new type
  ? ResourceEndpoint<E> // Then the endpoint is a resource endpoint
  : CollectionEndpoint<E, T>; // Otherwise it's a collection endpoint

/** Utility type that removes the same type from the available endpoint types */
export type NoSameEndpointType<E extends Endpoint> = Exclude<
  EndpointType,
  DataType<E>
>;

/** A descriptor or container for an endpoint type and path */
export interface EndpointDescriptor<E extends Endpoint> {
  path: E;
  type: DataType<E>;
}
