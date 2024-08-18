import { List } from "./data-types";
import {
  AnyType,
  DataType,
  DistinctEndpointType,
  Endpoint,
  EndpointType,
  ExtendQuery,
  KeyEndpointMap,
  MarvelQueryInterface,
  QueryCollection,
  Result,
  ResultMap,
} from "./utility-types";

import { endpointMap } from "../endpoints";

type ResourceEndpoint<E extends EndpointType> = DistinctEndpointType<
  [E, number]
>;
type EndpointResourceMap<E, T> = Record<string, Endpoint> & E;

type EndpointValues<E extends Endpoint> = EndpointValueMap[DataType<E>];

type UniqueEndpointType<T extends KeyEndpointMap<AnyType>> = {
  [K in keyof T]: T[K] extends EndpointType ? [T[K], number] : never;
};

type EndpointValueMap = {
  [K in keyof ResultMap]: UniqueEndpointType<(typeof endpointMap)[K]>;
};

type ValuesExtend<T> = T extends EndpointType ? [T, number] : Endpoint;

type EndpointId<T extends EndpointType> = DistinctEndpointType<[T, number]>;

type ExtendType<E extends Endpoint> = {
  [K in keyof Result<E>]: HasResourceURI<Result<E>[K]> extends true // Does the key include 'resourceURI'
    ? ExtendedResource<E, K> // Add properties to the resource
    : Result<E>[K] extends List // Is the value a list
    ? ExtendedCollection<E, K, Result<E>[K]> // Add properties to the collection
    : Result<E>[K];
};

// Helper type to check if a type includes 'resourceURI'
type HasResourceURI<T> = T extends { resourceURI: string } ? true : false;

// Helper type to check if a type includes 'collectionURI'
type HasCollectionURI<T> = T extends { collectionURI: string } ? true : false;

// Determine
type ExtendedResource<
  E extends Endpoint,
  K extends keyof Result<E>
> = K extends keyof EndpointValues<E> // Does the key exist in the endpoint values
  ? EndpointValues<E>[K] extends Endpoint // Is the value an endpoint
    ? ExtendResource<EndpointValues<E>[K], Result<E>[K]> // Add properties to the resource
    : never
  : never;

type ExtendedCollection<
  E extends Endpoint,
  K extends keyof Result<E>,
  V extends List
> = K extends keyof EndpointValues<E> // Does the key exist in the endpoint values
  ? EndpointValues<E>[K] extends Endpoint // Is the value an endpoint
    ? ExtendCollection<EndpointValues<E>[K], V> // Add properties to the collection
    : never
  : never;

type ExtendResource<E extends Endpoint, V> = V & ExtendResourceProperties<E>; // Add additional properties to the resource

type ExtendCollection<E extends Endpoint, V extends List> = V &
  ExtendCollectionProperties<E, V>;

type ExtendResourceList<E extends Endpoint, V extends List> = ExtendResource<
  E,
  V["items"][number]
>[];

// New properties for resource
type ExtendResourceProperties<E extends Endpoint> = {
  endpoint: E;
  query: ExtendQuery<E>;
  fetch?: () => Promise<MarvelQueryInterface<E>>;
};

// New properties for collection
type ExtendCollectionProperties<E extends Endpoint, V extends List> = {
  items: ExtendResourceList<E, V>;
  endpoint: E;
  query: QueryCollection<E>;
};

type ExtendResult<E extends Endpoint> = ExtendResource<E, ExtendType<E>>; // Add new properties to the result item

export {
  ExtendResult,
  ExtendType,
  ExtendResource,
  ExtendCollection,
  ExtendResourceProperties,
  ExtendCollectionProperties,
};
