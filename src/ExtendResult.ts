import {
  Endpoint,
	EndpointType,
  Extendpoint,
  ExtendQuery,
  InitializedQuery,
  List,
  MarvelQueryInterface,
  Parameters,
  QueryCollection,
  Result,
} from "./definitions/types";
import { endpointMap } from "./definitions/types/endpoints";
import {
  EndpointValues,
  ExtendType,
  ExtendResource,
  ExtendCollection,
  ExtendResourceProperties,
  ExtendCollectionProperties,
  ExtendResourceList,
} from "./definitions/types/extended-data-types";

export default function extendApiResult<E extends Endpoint>(
  result: Result<E>,
): ExtendType<E> {
  return Object.keys(result).reduce<ExtendType<E>>((acc, key) => {
    const value = result[key];
    const endpoint = endpointMap[key];

    // type

    if (hasResourceURI(value)) {
      acc[key as keyof ExtendType<E>] = extendResource(value, endpoint);
    } else if (hasCollectionURI(value)) {
      acc[key as keyof ExtendType<E>] = extendCollection(value, endpoint);
    } else {
      acc[key as keyof ExtendType<E>] = value;
    }

    return acc;
  }, {} as ExtendType<E>);
}

// Helper functions

function hasResourceURI<T>(obj: T): obj is T & { resourceURI: string } {
  return typeof (obj as any).resourceURI === "string";
}

function hasCollectionURI<T>(obj: T): obj is T & { collectionURI: string } {
  return typeof (obj as any).collectionURI === "string";
}

function extendResource<V, E extends Endpoint>(
  value: V,
  endpoint: E
): ExtendResource<E, V> {
  return {
    ...value,
    endpoint,
    query: createExtendQuery(endpoint),
    fetch: () => fetchMarvelQuery(endpoint),
  };
}

function extendCollection<V extends List, E extends Endpoint>(
  value: V,
  endpoint: E
): ExtendCollection<E, V> {
  return {
    ...value,
    endpoint,
    query: createQueryCollection(endpoint),
    items: value.items.map((item) => extendResource(item, endpoint)),
  };
}

// Example of functions that might create the query objects
function createExtendQuery<E extends Endpoint>(endpoint: E): ExtendQuery<E> {
  // Implementation specific to creating the query object
  return <E extends Endpoint, T extends EndpointType>(type: T, params: Parameters<Extendpoint<E,T>>): InitializedQuery<Extendpoint<E,T>> => {
		const query: InitQuery<Extendpoint<E,T>> = {
      endpoint,
      params,
    };
    console.log(query);
    return new MarvelQuery<Extendpoint<E,T, "init">(query); // Wont work because or circular dependency
		// return {} as InitializedQuery<Extendpoint<E,T>>;
	}
}

function createQueryCollection<E extends Endpoint>(
  endpoint: E
): QueryCollection<E> {
  // Implementation specific to creating the collection query object
  return {} as QueryCollection<E>;
}

function fetchMarvelQuery<E extends Endpoint>(
  endpoint: E
): Promise<MarvelQueryInterface<E, "loaded">> {
  // Implementation of the fetch function
  return Promise.resolve({} as MarvelQueryInterface<E, "loaded">);
}