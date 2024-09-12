import { Collection, Resource } from "./data-types";
import { ResultMap } from "./data-types";
import { DataType, Result } from "./data-types";
import { Parameters } from "./param-types";
import {
  Endpoint,
  EndpointType,
  Extendpoint,
  ResourceEndpoint,
  IsEndpointType,
  NoSameEndpointType,
  CollectionEndpoint,
} from "./endpoint-types";
import { MarvelQueryInterface } from "./interface";
import { ENDPOINT_MAP } from "../endpoints";

/** Map of endpoint types to their corresponding property types. */
type EndpointValueMap = {
  [K in keyof ResultMap]: UniqueEndpointType<(typeof ENDPOINT_MAP)[K]>;
};

/** Endpoint types for collections and resources for each property of the data type returned */
type EndpointValues<E extends Endpoint> = EndpointValueMap[DataType<E>];

/** Returns the unique endpoint types for each property in the data type returned */
type UniqueEndpointType<T> = {
  [K in keyof T]: IsEndpointType<T[K]>;
};

/** Extends the type of the result with additional properties. */
export type ExtendType<E> = E extends Endpoint
  ? {
      [K in keyof Result<E>]: Result<E>[K] extends Collection // Iterate through each property in the result type
        ? ExtendedCollection<E, K, Result<E>[K]> // If the property is a collection, inject the AutoQuery properties
        : RequiredNonNullable<Result<E>>[K] extends Resource // If the property a resource,
        ? ExtendedResource<E, K> // Also inject the AutoQuery properties, but for a resource
        : RequiredNonNullable<Result<E>>[K] extends Array<Resource> // If the property is an array of resources
        ? ExtendedResourceArray<E, K> // Inject each resource with the AutoQuery properties
        : Result<E>[K];
    }
  : ["utility-types.ts ExtendType", "Cannot extend type"];

/** Utility type that makes all properties in T required and non-nullable */
type RequiredNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/** Determines the endpoint type of the collection with the EndpointValues map and injects the properties for AutoQuery */
type ExtendedCollection<
  E extends Endpoint,
  K extends keyof Result<E>,
  V extends Collection
> = K extends keyof EndpointValues<E> // Determines the data type for the collection
  ? ExtendCollection<CollectionEndpoint<E, EndpointValues<E>[K]>, V> // Adds properties to the collection with an endpoint type from the EndpointValues map
  : Result<E>[K]; // This should never happen, but just in case.

/** Determines the endpoint type of the resource with the EndpointValues map and injects the properties for AutoQuery */
type ExtendedResource<
  E extends Endpoint,
  K extends keyof Result<E>
> = K extends keyof EndpointValues<E> // Determines the data type of the resource
  ? ExtendResource<ResourceEndpoint<E>, Result<E>[K]> // Adds properties to the resource with an endpoint type from the EndpointValues map
  : Result<E>[K]; // This should never happen, but just in case.

/** Determines the endpoint type of the resource array with the EndpointValues map and injects the properties for AutoQuery */
type ExtendedResourceArray<
  E extends Endpoint,
  K extends keyof Result<E>
> = K extends keyof EndpointValues<E> // Determines the data type of the resource array
  ? Result<E>[K] extends Array<Resource> // And if the property is an array of resources
    ? ExtendResourceArray<Extendpoint<E, EndpointValues<E>[K]>, Result<E>[K]> // Adds properties to the resource array with an endpoint type from the EndpointValues map
    : Result<E>[K] // This should never happen, but just in case.
  : Result<E>[K]; // This should never happen, but just in case.

/** Adds AutoQuery properties to a resource */
export type ExtendResource<E extends Endpoint, V> = V &
  ExtendResourceProperties<E>;

/** Adds AutoQuery properties to a collection */
export type ExtendCollection<E extends Endpoint, V extends Collection> = V &
  ExtendCollectionProperties<E, V>;

/** Adds AutoQuery properties to a collection of resources */
export type ExtendCollectionResources<
  E extends Endpoint,
  V extends Collection
> = ExtendResource<E, V["items"][number]>[];

/** Adds AutoQuery properties to an array of resources */
type ExtendResourceArray<
  E extends Endpoint,
  V extends Array<Resource>
> = ExtendResource<E, V[number]>[];

/** AutoQuery properties for a resource */
export type ExtendResourceProperties<E extends Endpoint> = {
  endpoint: E;
  query: QueryResource<E>;
  fetch: () => Promise<MarvelQueryInterface<E>>;
  fetchSingle: () => Promise<ExtendResult<E>>;
};

/** AutoQuery properties for collection */
export type ExtendCollectionProperties<
  E extends Endpoint,
  V extends Collection
> = {
  items: ExtendCollectionResources<ResourceEndpoint<E>, V>;
  endpoint: E;
  query: QueryCollection<E>;
};

/** Type of the query method for a resource */
type QueryResource<TEndpoint extends Endpoint> = <
  TType extends NoSameEndpointType<TEndpoint>
>(
  type: TType,
  params?: Parameters<Extendpoint<TEndpoint, TType>>
) => MarvelQueryInterface<Extendpoint<TEndpoint, TType>>;

type QueryCollection<E extends Endpoint> = (
  params?: Parameters<E>
) => MarvelQueryInterface<E>;
export type InitQuery<E extends Endpoint> = {
  endpoint: E;
  params: Parameters<E>;
};

/** Injects AutoQuery in each result property containing a resource or collection,
 * and adds the AutoQuery properties to the result itself.
 */
export type ExtendResult<E extends Endpoint> = ExtendType<E> &
  ExtendResourceProperties<E>;