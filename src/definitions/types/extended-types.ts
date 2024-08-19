import {
  List,
} from "./data-types";
import {
  AnyType,
  DataType,
  ExtendQuery,
  QueryCollection,
  Result,
	ResultMap,
} from "./utility-types";
import {
  DistinctEndpointType,
  Endpoint,
  EndpointType, Extendpoint, KeyEndpointMap
} from "./endpoint-types";
import { MarvelQueryInterface } from "./interface";

import { endpointMap } from "../endpoints";

export type EndpointValues<E extends Endpoint> = EndpointValueMap[DataType<E>];

type UniqueEndpointType<T> = {
	[K in keyof T]: T[K] extends EndpointType ? T[K] : ["Error: Not a valid EndpointType", T[K]];
};

export type EndpointValueMap = {
	[K in keyof ResultMap]: UniqueEndpointType<typeof endpointMap[K]>
}

export type ValuesExtend<T> = T extends EndpointType ? [T, number] : Endpoint;

export type EndpointId<T extends EndpointType> = DistinctEndpointType<[T, number]>;

export type ExtendType<E extends Endpoint> = {
  [K in keyof Result<E>]: HasResourceURI<Result<E>[K]> extends true // Does the key include 'resourceURI'
    ? ExtendedResource<E, K> // Add properties to the resource
    : Result<E>[K] extends List // Is the value a list
    ? ExtendedCollection<E, K, Result<E>[K]> // Add properties to the collection
    : Result<E>[K];
};

// Helper type to check if a type includes 'resourceURI'
export type HasResourceURI<T> = T extends { resourceURI: string }
  ? true
  : false;

// Helper type to check if a type includes 'collectionURI'
export type HasCollectionURI<T> = T extends { collectionURI: string }
  ? true
  : false;

// Determine
export type ExtendedResource<
  E extends Endpoint,
  K extends keyof Result<E>
> = K extends keyof EndpointValues<E> // Does the key exist in the endpoint values
  ? EndpointValues<E>[K] extends EndpointType // Is the value an endpoint
    ? ExtendResource<[E[0], number, EndpointValues<E>[K]], Result<E>[K]> // Add properties to the resource
    : Result<E>[K]
  : Result<E>[K];

type ExtendedCollection<
  E extends Endpoint,
  K extends keyof Result<E>,
  V extends List
> = K extends keyof EndpointValues<E> // Does the key exist in the endpoint values
  ? EndpointValues<E>[K] extends EndpointType // Is the value an endpoint
    ? ExtendCollection<[E[0], number, EndpointValues<E>[K]], V> // Add properties to the collection
    : ["Not an endpoint"] // Result<E>[K]
  : ["No endpoint found"] // Result<E>[K]

export type ExtendResource<E, V> = E extends Endpoint ? V &
  ExtendResourceProperties<E> : ["Not an endpoint"]; // Add additional properties to the resource

export type ExtendCollection<E, V extends List> = E extends Endpoint ? V &
ExtendCollectionProperties<E, V> : ["Not an endpoint"];

export type ExtendResourceList<
  E extends Endpoint,
  V extends List
> = ExtendResource<E, V["items"][number]>[];

// New properties for resource
export type ExtendResourceProperties<E extends Endpoint> = {
  endpoint: E;
  query: ExtendQuery<E>;
  fetch?: () => Promise<MarvelQueryInterface<E>>;
};

// New properties for collection
export type ExtendCollectionProperties<E extends Endpoint, V extends List> = {
  items: ExtendResourceList<E, V>;
  endpoint: E;
  query: QueryCollection<E>;
};

export type ExtendResult<E extends Endpoint> = ExtendResource<E, ExtendType<E>> // Add new properties to the result item
