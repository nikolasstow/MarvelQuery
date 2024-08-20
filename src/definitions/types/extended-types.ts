import { List } from "./data-types";
import {
  AnyType,
  DataType,
  ExtendQuery,
  QueryCollection,
  Result,
  ResultMap,
} from "./utility-types";
import {
  BaseEndpoint,
  DistinctEndpointType,
  Endpoint,
  EndpointType,
  EndpointTyped,
  ExtendedQueryResult,
  Extendpoint,
  KeyEndpointMap,
  ResourceEndpoint,
} from "./endpoint-types";
import { MarvelQueryInterface } from "./interface";

import { endpointMap } from "../endpoints";

export type EndpointValues<E extends Endpoint> = EndpointValueMap[DataType<E>];

type UniqueEndpointType<T> = {
  [K in keyof T]: T[K] extends EndpointType
    ? T[K]
    : ["UniqueEndpointType", "Error: Not a valid EndpointType", T[K]];
};

export type EndpointValueMap = {
  [K in keyof ResultMap]: UniqueEndpointType<(typeof endpointMap)[K]>;
};

export type ValuesExtend<T> = T extends EndpointType ? [T, number] : Endpoint;

export type EndpointId<T extends EndpointType> = DistinctEndpointType<
  [T, number]
>;

export type ExtendType<E> = E extends Endpoint
  ? {
      [K in keyof Result<E>]: HasResourceURI<Result<E>[K]> extends true // Does the key include 'resourceURI'
        ? ExtendedResource<E, K> // Add properties to the resource
        : Result<E>[K] extends List // Is the value a list
        ? ExtendedCollection<E, K, Result<E>[K]> // Add properties to the collection
        : Result<E>[K];
    }
  : ["utility-types.ts ExtendType", "Cannot extend type"];

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
    ? ExtendResource<Extendpoint<E, EndpointValues<E>[K]>, Result<E>[K]> // Add properties to the resource
    : Result<E>[K]
  : Result<E>[K];

type ExtendedCollection<
  E extends Endpoint,
  K extends keyof Result<E>,
  V extends List
> = K extends keyof EndpointValues<E> // Does the key exist in the endpoint values
  ? EndpointValues<E>[K] extends EndpointType // Is the value an endpoint
    ? ExtendCollection<Extendpoint<E, EndpointValues<E>[K]>, V> // Add properties to the collection
    : ["ExtendedCollection", "Not an endpoint", EndpointValues<E>[K]] // Result<E>[K]
  : ["ExtendedCollection", "No endpoint found", K]; // Result<E>[K]

export type ExtendResource<E extends Endpoint, V> = V &
  ExtendResourceProperties<E>;

["ExtendResource", "Not an endpoint"];

export type ExtendCollection<E extends Endpoint, V extends List> = V &
  ExtendCollectionProperties<E, V>;

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
  items: ExtendResourceList<ResourceEndpoint<E>, V>;
  endpoint: E;
  query: QueryCollection<E>;
};

// This logic below looks strange but done this way to assure that the return type is correct
export type ExtendResult<E extends Endpoint> = ExtendType<E> &
  ExtendResourceProperties<E>;

// export type ReturnType<E extends Endpoint> = ExtendType<[DataType<E>]> &
// ExtendResourceProperties<TypeToEndpoint<DataType<E>>>;

// type TypeToEndpoint<E extends EndpointType> = [E] extends Endpoint ? [E] : never;

export type ReturnType<T extends EndpointType> =
  | ExtendResult<EndpointTyped<T>>
  | ExtendResult<ExtendedQueryResult<T>>;
