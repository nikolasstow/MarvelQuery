import { z } from 'zod';
import {
  TextObject,
  URL,
  Image,
  ComicDate,
  ComicPrice,
  Summary,
  RoleSummary,
  TypeSummary,
  ComicSummary,
  StorySummary,
  SeriesSummary,
  CreatorSummary,
  CharacterSummary,
  EventSummary,
  List,
  ComicList,
  StoryList,
  SeriesList,
  EventList,
  CreatorList,
  CharacterList,
  MarvelResult,
  MarvelComic,
  MarvelEvent,
  MarvelSeries,
  MarvelCreator,
  MarvelCharacter,
  MarvelStory,
} from './data-schemas';

export type TextObject = z.infer<typeof TextObject>;
export type URL = z.infer<typeof URL>;
export type Image = z.infer<typeof Image>;
export type ComicDate = z.infer<typeof ComicDate>;
export type ComicPrice = z.infer<typeof ComicPrice>;

export type Summary = z.infer<typeof Summary>;
export type RoleSummary = z.infer<typeof RoleSummary>;
export type TypeSummary = z.infer<typeof TypeSummary>;
export type ComicSummary = z.infer<typeof ComicSummary>;
export type StorySummary = z.infer<typeof StorySummary>;
export type SeriesSummary = z.infer<typeof SeriesSummary>;
export type CreatorSummary = z.infer<typeof CreatorSummary>;
export type CharacterSummary = z.infer<typeof CharacterSummary>;
export type EventSummary = z.infer<typeof EventSummary>;

export type List = z.infer<typeof List>;
export type ComicList = z.infer<typeof ComicList>;
export type StoryList = z.infer<typeof StoryList>;
export type SeriesList = z.infer<typeof SeriesList>;
export type EventList = z.infer<typeof EventList>;
export type CreatorList = z.infer<typeof CreatorList>;
export type CharacterList = z.infer<typeof CharacterList>;

export type MarvelResult = z.infer<typeof MarvelResult>;
export type MarvelComic = z.infer<typeof MarvelComic>;
export type MarvelEvent = z.infer<typeof MarvelEvent>;
export type MarvelSeries = z.infer<typeof MarvelSeries>;
export type MarvelCreator = z.infer<typeof MarvelCreator>;
export type MarvelCharacter = z.infer<typeof MarvelCharacter>;
export type MarvelStory = z.infer<typeof MarvelStory>;

export interface Metadata {
  code: number;
  status: string;
  copyright: string;
  attributionText: string;
  attributionHTML: string;
  etag: string;
}

export interface APIResponseData {
  offset: number;
  limit: number;
  total: number;
  count: number;
}

export interface APIResponseResults<MarvelType extends MarvelResult>
  extends APIResponseData {
  results: MarvelType[];
}

export interface APIWrapper<T extends MarvelResult> extends Metadata {
  data: APIResponseResults<T>;
}

export { z };
export * from './api-interface';
