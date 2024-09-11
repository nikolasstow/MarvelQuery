import { EndpointFromType } from "./endpoint";
import {
  MarvelResult,
  MarvelCharacter,
  MarvelComic,
  MarvelCreator,
  MarvelEvent,
  MarvelStory,
  MarvelSeries,
} from "./data-types";
import {
  Endpoint,
  EndpointType,
  NoSameEndpointType,
  Extendpoint,
} from "./endpoint";
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

export type ParameterMap = {
  comics: ComicParams;
  characters: CharacterParams;
  creators: CreatorParams;
  events: EventParams;
  stories: StoryParams;
  series: SeriesParams;
};

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

export type DataType<E> = E extends Endpoint
  ? E[2] extends EndpointType
    ? E[2]
    : E[0] extends EndpointType
    ? E[0]
    : ["Error, could not determine data type", E]
  : ["Error, not a valid endpoint", E];

export type Parameters<E extends Endpoint> =
  | ParameterType<E>
  | {
      offset?: number;
      limit?: number;
    };

export type ParameterType<E extends readonly unknown[]> = E extends [
  infer First,
  infer Second,
  infer Third
]
  ? Third extends EndpointType
    ? ParameterMap[Third]
    : never
  : E extends [infer First, infer Second]
  ? Second extends number
    ? never
    : never
  : E extends [infer First]
  ? First extends EndpointType
    ? ParameterMap[First]
    : never
  : APIBaseParams;

export type ParameterTyspe<E extends readonly unknown[]> = E extends [
  infer First,
  infer Second,
  infer Third
]
  ? Third extends EndpointType
    ? ParameterMap[Third]
    : never
  : E extends [infer Second]
  ? Second extends number
    ? never
    : never
  : E extends [infer First]
  ? First extends EndpointType
    ? ParameterMap[First]
    : never
  : APIBaseParams;

export type Result<E extends Endpoint> = ResultMap[DataType<E>];

export type OnResultFunction<R extends MarvelResult> = (
  data: R[]
) => void | Promise<unknown>;

export type AnyResultFunction = OnResultFunction<AnyType>;

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
  params?: Parameters<Extendpoint<TEndpoint, TType>>
) => MarvelQueryInterface<Extendpoint<TEndpoint, TType>>;

export type QueryCollection<E extends Endpoint> = (
  params?: Parameters<E>
) => MarvelQueryInterface<E>;

export type InitializedQuery<E> = E extends Endpoint
  ? MarvelQueryInterface<E>
  : ["utility-types.ts InitializedQuery", "Cannot initialize query."];

export type ValidEndpoint<E> = E extends Endpoint ? E : never;

export type CreateQueryFunction = {
  <T extends Endpoint>(
    endpoint: T,
    params: Parameters<T>
  ): MarvelQueryInterface<T>;
  <T extends EndpointType>(
    endpoint: T,
    params: Parameters<EndpointFromType<T>>
  ): MarvelQueryInterface<EndpointFromType<T>>;
};
