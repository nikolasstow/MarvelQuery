import { z } from 'zod';
import { DataTypeKey } from './api-interface';

// Use .nullable() to allow null values

export const TextObject = z.object({
  type: z.string(),
  language: z.string(),
  text: z.string(),
});

export const URL = z.object({
  type: z.string(),
  url: z.string().url(),
});

export const Image = z.object({
  path: z.string().url(),
  extension: z.string(),
});

export const ComicDate = z.object({
  type: z.string(),
  date: z.string().datetime({ offset: true }),
});

export const ComicPrice = z.object({
  type: z.string(),
  price: z.number(),
});

export const Summary = z.object({
  id: z.number().default(0),
  resourceURI: z.string(),
  name: z.string(),
});

export const RoleSummary = Summary.extend({
  role: z.string().nullable().optional(),
});

export const TypeSummary = Summary.extend({
  type: z.string(),
});

export const ComicSummary = Summary;

export const StorySummary = TypeSummary;

export const SeriesSummary = Summary;

export const CreatorSummary = RoleSummary;

export const CharacterSummary = RoleSummary;

export const EventSummary = Summary;

export const List = z.object({
  available: z.number(),
  returned: z.number(),
  collectionURI: z.string().url(),
  items: z.array(Summary),
});

export const ComicList = List.extend({
  items: z.array(ComicSummary),
});

export const StoryList = List.extend({
  items: z.array(StorySummary),
});

export const SeriesList = List.extend({
  items: z.array(SeriesSummary),
});

export const EventList = List.extend({
  items: z.array(EventSummary),
});

export const CreatorList = List.extend({
  items: z.array(CreatorSummary),
});

export const CharacterList = List.extend({
  items: z.array(RoleSummary),
});

export const MarvelResult = z.object({
  id: z.number(),
  modified: z.string().datetime({ offset: true }),
  resourceURI: z.string().url(),
  urls: z.array(URL),
  thumbnail: Image.nullable().optional(),
});

export const MarvelComic = MarvelResult.extend({
  digitalId: z.number().nullable().optional(),
  title: z.string(),
  issueNumber: z.number().default(0),
  variantDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
  upc: z.string().nullable().optional(),
  diamondCode: z.string().nullable().optional(),
  ean: z.string().nullable().optional(),
  issn: z.string().nullable().optional(),
  format: z.string().nullable().optional().default('Unknown'),
  pageCount: z.number().default(0),
  textObjects: z.array(TextObject),
  series: SeriesSummary,
  variants: z.array(ComicSummary),
  collections: z.array(ComicSummary),
  collectedIssues: z.array(ComicSummary),
  dates: z.array(ComicDate),
  prices: z.array(ComicPrice),
  images: z.array(Image),
  creators: CreatorList,
  characters: CharacterList,
  stories: StoryList,
  events: EventList,
});

export const MarvelEvent = MarvelResult.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  start: z.string(),
  end: z.string().nullable().optional(),
  comics: ComicList,
  stories: StoryList,
  series: SeriesList,
  characters: CharacterList,
  creators: CreatorList,
  next: EventSummary.nullable().optional(),
  previous: EventSummary.nullable().optional(),
});

export const MarvelSeries = MarvelResult.extend({
  title: z.string(),
  description: z.union([z.string(), z.null()]).nullable().optional(),
  startYear: z.string().or(z.number()),
  endYear: z.number().or(z.number()),
  rating: z.string(),
  comics: ComicList,
  stories: StoryList,
  events: EventList,
  characters: CharacterList,
  creators: CreatorList,
  next: SeriesSummary.nullable().optional(),
  previous: SeriesSummary.nullable().optional(),
});

export const MarvelCreator = MarvelResult.extend({
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  suffix: z.string().nullable().optional(),
  fullName: z.string(),
  series: SeriesList,
  stories: StoryList,
  comics: ComicList,
  events: EventList,
});

export const MarvelCharacter = MarvelResult.extend({
  name: z.string(),
  description: z.string().nullable().optional(),
  comics: ComicList,
  stories: StoryList,
  events: EventList,
  series: SeriesList,
});

export const MarvelStory = MarvelResult.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  comics: ComicList,
  series: SeriesList,
  events: EventList,
  characters: CharacterList,
  creators: CreatorList,
  originalissue: ComicSummary.nullable().optional(),
});

export const MarvelResults = z.array(MarvelResult);
export const MarvelComics = z.array(MarvelComic);
export const MarvelEvents = z.array(MarvelEvent);
export const MarvelSeriesList = z.array(MarvelSeries);
export const MarvelCreators = z.array(MarvelCreator);
export const MarvelCharacters = z.array(MarvelCharacter);
export const MarvelStories = z.array(MarvelStory);

type ResultMapSchema = {
  [Key in DataTypeKey]: z.ZodType;
};

export const ResultSchemaMap: ResultMapSchema = {
  comics: MarvelComics,
  events: MarvelEvents,
  series: MarvelSeriesList,
  creators: MarvelCreators,
  characters: MarvelCharacters,
  stories: MarvelStories,
}

export { z };
export { ValidateParams } from './param-schemas';