import {
  MarvelResult,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelStory,
  MarvelSeries,
  List,
  ComicList,
  CharacterList,
  CreatorList,
  EventList,
  StoryList,
  SeriesList,
  Summary,
} from "./data-types";
import { Endpoint, EndpointType, NoSameEndpointType, Extendpoint } from "./endpoint-types";
import { ExtendResourceProperties } from "./extended-types";
import { MarvelQueryInterface } from "./interface";
import {
  ComicParams,
  CharacterParams,
  CreatorParams,
  EventParams,
  StoryParams,
  SeriesParams,
  APIBaseParams,
} from "./param-types";

/** A map of parameters to their corresponding types providing type safety. */
export type ParameterMap = {
  comics: ComicParams;
  characters: CharacterParams;
  creators: CreatorParams;
  events: EventParams;
  stories: StoryParams;
  series: SeriesParams;
};

/** A map of results to their corresponding types providing type safety. */
export type ResultMap = {
  comics: MarvelComic;
  characters: MarvelCharacter;
  creators: MarvelCreator;
  events: MarvelEvent;
  stories: MarvelStory;
  series: MarvelSeries;
};

export type InitQuery<E extends Endpoint> = {
  endpoint: E;
  params: Parameters<E>;
};

/** Utitility type that determines which type of data being queried.
 * It works by checking the endpoint and looking for the last data type in the endpoint.
 * If the last element is a type, use it. If it's a number, use the type in the first element.
 */
export type DataType<E extends readonly unknown[]> = E extends [
  ...infer _,
  infer LastElement extends EndpointType
]
  ? LastElement extends number
    ? E extends [infer FirstElement, ...unknown[]]
      ? FirstElement
      : never
    : LastElement
  : never;

/** Utility type that gets the parameters from the endpoint. */
export type Parameters<E extends readonly unknown[]> = E extends [
  infer First,
  infer Second,
  infer Third
] // Does the Endpoint have three elements?
  ? Third extends EndpointType // Is the third element a data type?
    ? ParameterMap[Third] // The third element is the data type
    : never
  : E extends [infer First, infer Second] // Does the Endpoint have two elements?
  ? Second extends number // Is the second element a number?
    ? never // No parameters when the endpoint is for an individual item
    : never
  : E extends [infer First] // Is the endpoint only one element?
  ? First extends EndpointType // Is the element a data type?
    ? ParameterMap[First] // The element is the data type
    : never
  : APIBaseParams;

/** Utility type that gets the result type from the endpoint. */
export type Result<E extends Endpoint> = DataType<E> extends EndpointType
  ? ResultMap[DataType<E>]
  : never;

/** Type of function that will be called when the query is finished, and passes the results as an array. */
export type OnResultFunction<R extends MarvelResult> = (
  data: R[]
) => void | Promise<unknown>;

/** A function that will be called when a query of any type is finished, unless overridden with onResult function for a specific type. */
export type AnyResultFunction = OnResultFunction<AnyType>;

/** A union of all data types. */
export type AnyType =
  | MarvelComic
  | MarvelCharacter
  | MarvelCreator
  | MarvelEvent
  | MarvelSeries
  | MarvelStory;

export type AnyParams =
  | APIBaseParams
  | ComicParams
  | CharacterParams
  | CreatorParams
  | EventParams
  | StoryParams
  | SeriesParams
  | undefined;

export type ExtendQuery<TEndpoint extends Endpoint> = <
  TType extends NoSameEndpointType<TEndpoint>
>(
  type: TType,
  params: Parameters<Extendpoint<TEndpoint, TType>>
) => InitializedQuery<Extendpoint<TEndpoint, TType>>;

export type QueryCollection<E extends Endpoint> = (
  params: Parameters<E>
) => InitializedQuery<E>;

export type InitializedQuery<E> = E extends Endpoint ? MarvelQueryInterface<E> : ["Cannot initialize query."];
