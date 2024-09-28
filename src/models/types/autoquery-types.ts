import { Collection, Resource, APIResult } from "./data-types";
import { Params } from "./param-types";
import {
  Endpoint,
  Extendpoint,
  ResourceEndpoint,
  NoSameEndpointType,
  CollectionEndpoint,
  EndpointType,
  IsEndpoint,
} from "./endpoint-types";
import { MarvelQueryInit } from "./interface";

/** Extends the type of the result with additional properties. */
export type ExtendType<E extends Endpoint> = E extends Endpoint
  ? {
      [K in keyof APIResult<E>]: APIResult<E>[K] extends Collection // Iterate through each property in the result type
        ? ExtendCollection<CollectionEndpoint<E, K>, APIResult<E>[K]> // If the property is a collection, inject the AutoQuery properties
        : RequiredNonNullable<APIResult<E>>[K] extends Resource // If the property a resource,
        ? ExtendResource<ResourceEndpointFromKey<E, K>, APIResult<E>[K]> // Also inject the AutoQuery properties, but for a resource
        : RequiredNonNullable<APIResult<E>>[K] extends Array<Resource> // If the property is an array of resources
        ? ExtendResourceArray<ResourceEndpointFromKey<E, K>, APIResult<E>[K]> // Inject each resource with the AutoQuery properties
        : APIResult<E>[K];
    }
  : never;

/** The type of an endpoint as determined by it's property keyy, a mirror of the determineEndpointType method in AutoQuery. */
export type ResourceEndpointFromKey<
  E extends Endpoint,
  K
> = K extends EndpointType
  ? ResourceEndpoint<IsEndpoint<[K, number]>>
  : K extends "originalIssue"
  ? ResourceEndpoint<IsEndpoint<["comics", number]>>
  : ResourceEndpoint<E>;

/** Utility type that makes all properties in T required and non-nullable */
type RequiredNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

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
type ExtendResourceArray<E extends Endpoint, V> = V extends Array<Resource>
  ? ExtendResource<E, V[number]>[]
  : ["Error: Expected an array of resources", V];

/** AutoQuery properties for a resource */
export type ExtendResourceProperties<E extends Endpoint> = {
  endpoint: E;
  query: QueryResource<E>;
  fetch: () => Promise<MarvelQueryInit<E, true>>;
  fetchSingle: () => Promise<ExtendResult<E>>;
};

/** AutoQuery properties for a collection */
export type ExtendCollectionProperties<
  E extends Endpoint,
  V extends Collection
> = {
  items: ExtendCollectionResources<ResourceEndpoint<E>, V>;
  endpoint: E;
  query: QueryCollection<E>;
};

/** Query method for a resource */
type QueryResource<E extends Endpoint> = <TType extends NoSameEndpointType<E>>(
  type: TType,
  params?: Params<Extendpoint<E, TType>>
) => MarvelQueryInit<Extendpoint<E, TType>, true>;

/** Query method for a collection */
type QueryCollection<E extends Endpoint> = (
  params?: Params<E>
) => MarvelQueryInit<E, true>;

/** Initial query method for an instance */
export type InitQuery<E extends Endpoint> = {
  endpoint: E;
  params: Params<E>;
};

/** Injects AutoQuery in each result property containing a resource or collection,
 * and adds the AutoQuery properties to the result itself.
 */
export type ExtendResult<E extends Endpoint> = ExtendType<E> &
  ExtendResourceProperties<E>;

export type Result<E extends Endpoint, AQ extends boolean> = AQ extends true
  ? ExtendResult<E>
  : APIResult<E>;
