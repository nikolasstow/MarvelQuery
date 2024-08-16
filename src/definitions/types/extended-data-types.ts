import {
  List,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelSeries,
  MarvelStory,
} from "./data-types";
import {
  AnyType,
  DataType,
  DistinctEndpointType,
  Endpoint,
  EndpointType,
  ExtendQuery,
  MarvelQueryInterface,
  Modify,
  QueryCollection,
  Result,
} from "./utility-types";

type ResourceEndpoint<E extends EndpointType> = DistinctEndpointType<
  [E, number]
>;
type EndpointResourceMap<E, T> = Record<string, Endpoint> & E;

type ComicEndpoints = EndpointResourceMap<
  {
    series: ResourceEndpoint<"series">;
    variants: ResourceEndpoint<"comics">;
    collections: ResourceEndpoint<"comics">;
    collectedIssues: ResourceEndpoint<"comics">;
    creators: ResourceEndpoint<"creators">;
    characters: ResourceEndpoint<"characters">;
    stories: ResourceEndpoint<"stories">;
    events: ResourceEndpoint<"events">;
  },
  MarvelComic
>;

type EventEndpoints = EndpointResourceMap<
  {
    comics: ResourceEndpoint<"comics">;
    stories: ResourceEndpoint<"stories">;
    series: ResourceEndpoint<"series">;
    characters: ResourceEndpoint<"characters">;
    creators: ResourceEndpoint<"creators">;
    next: ResourceEndpoint<"events">;
    previous: ResourceEndpoint<"events">;
  },
  MarvelEvent
>;

type SeriesEndpoints = EndpointResourceMap<
  {
    comics: ResourceEndpoint<"comics">;
    stories: ResourceEndpoint<"stories">;
    events: ResourceEndpoint<"events">;
    characters: ResourceEndpoint<"characters">;
    creators: ResourceEndpoint<"creators">;
    next: ResourceEndpoint<"series">;
    previous: ResourceEndpoint<"series">;
  },
  MarvelSeries
>;

type CreatorEndpoints = EndpointResourceMap<
  {
    series: ResourceEndpoint<"series">;
    stories: ResourceEndpoint<"stories">;
    comics: ResourceEndpoint<"comics">;
    events: ResourceEndpoint<"events">;
  },
  MarvelCreator
>;

type CharacterEndpoints = EndpointResourceMap<
  {
    comics: ResourceEndpoint<"comics">;
    stories: ResourceEndpoint<"stories">;
    events: ResourceEndpoint<"events">;
    series: ResourceEndpoint<"series">;
  },
  MarvelCharacter
>;

type StoryEndpoints = EndpointResourceMap<
  {
    comics: ResourceEndpoint<"comics">;
    series: ResourceEndpoint<"series">;
    events: ResourceEndpoint<"events">;
    characters: ResourceEndpoint<"characters">;
    creators: ResourceEndpoint<"creators">;
    originalIssue: ResourceEndpoint<"comics">;
  },
  MarvelStory
>;

export type EndpointValues<E extends Endpoint> = EndpointValueMap[DataType<E>];

export type EndpointValueMap = {
  comics: ComicEndpoints;
  characters: CharacterEndpoints;
  creators: CreatorEndpoints;
  events: EventEndpoints;
  stories: StoryEndpoints;
  series: SeriesEndpoints;
};

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

export type ExtendResource<E extends Endpoint, V> = V &
  ExtendResourceProperties<E>; // Add additional properties to the resource

export type ExtendCollection<E extends Endpoint, V extends List> = V &
      ExtendCollectionProperties<E, V>;

// export type ExtendedResourceList<E extends Endpoint, V> = V extends {
//   items: Array<infer Item>;
// }
//   ? {
//       items: Array<Item & ExtendResourceProperties<E>>;
//     }
//   : never;

// export type ExtendResourceList<E extends Endpoint, V extends List> = {
//   [K in keyof V["items"]]: V["items"][K] & ExtendResourceProperties<E>;
// };

export type ExtendResourceList<E extends Endpoint, V extends List> = ExtendResource<E, V["items"][number]>[]

// New properties for resource
export type ExtendResourceProperties<E extends Endpoint> = {
  endpoint: E;
  query: ExtendQuery<E>;
  // fetch?: () => Promise<MarvelQueryInterface<E, "loaded">>;
};

// New properties for collection
export type ExtendCollectionProperties<
  E extends Endpoint,
  V extends List
> = {
  items: ExtendResourceList<E, V>;
  endpoint: ExtendResourceProperties<E>["endpoint"];
  query: QueryCollection<E>;
};

export type ExtendResult<E extends Endpoint> = ExtendType<E> &
  ExtendResourceProperties<E>; // Add new properties to the result item
