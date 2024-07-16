import { z } from 'zod';
import {
  TextObjectSchema,
  URLSchema,
  ImageSchema,
  ComicDateSchema,
  ComicPriceSchema,
  SummarySchema,
  RoleSummarySchema,
  TypeSummarySchema,
  ComicSummarySchema,
  StorySummarySchema,
  SeriesSummarySchema,
  CreatorSummarySchema,
  CharacterSummarySchema,
  EventSummarySchema,
  ListSchema,
  ComicListSchema,
  StoryListSchema,
  SeriesListSchema,
  EventListSchema,
  CreatorListSchema,
  CharacterListSchema,
  MarvelResultSchema,
  MarvelComicSchema,
  MarvelEventSchema,
  MarvelSeriesSchema,
  MarvelCreatorSchema,
  MarvelCharacterSchema,
  MarvelStorySchema,
} from '../schemas/data-schemas';

export type TextObject = z.infer<typeof TextObjectSchema>;
export type URL = z.infer<typeof URLSchema>;
export type Image = z.infer<typeof ImageSchema>;
export type ComicDate = z.infer<typeof ComicDateSchema>;
export type ComicPrice = z.infer<typeof ComicPriceSchema>;

export type Summary = z.infer<typeof SummarySchema>;
export type RoleSummary = z.infer<typeof RoleSummarySchema>;
export type TypeSummary = z.infer<typeof TypeSummarySchema>;
export type ComicSummary = z.infer<typeof ComicSummarySchema>;
export type StorySummary = z.infer<typeof StorySummarySchema>;
export type SeriesSummary = z.infer<typeof SeriesSummarySchema>;
export type CreatorSummary = z.infer<typeof CreatorSummarySchema>;
export type CharacterSummary = z.infer<typeof CharacterSummarySchema>;
export type EventSummary = z.infer<typeof EventSummarySchema>;

export type List = z.infer<typeof ListSchema>;
export type ComicList = z.infer<typeof ComicListSchema>;
export type StoryList = z.infer<typeof StoryListSchema>;
export type SeriesList = z.infer<typeof SeriesListSchema>;
export type EventList = z.infer<typeof EventListSchema>;
export type CreatorList = z.infer<typeof CreatorListSchema>;
export type CharacterList = z.infer<typeof CharacterListSchema>;

export type MarvelResult = z.infer<typeof MarvelResultSchema>;
export type MarvelComic = z.infer<typeof MarvelComicSchema>;
export type MarvelEvent = z.infer<typeof MarvelEventSchema>;
export type MarvelSeries = z.infer<typeof MarvelSeriesSchema>;
export type MarvelCreator = z.infer<typeof MarvelCreatorSchema>;
export type MarvelCharacter = z.infer<typeof MarvelCharacterSchema>;
export type MarvelStory = z.infer<typeof MarvelStorySchema>;

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
