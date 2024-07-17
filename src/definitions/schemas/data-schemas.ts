import { z } from "zod";
import { EndpointMap } from "../types/api-interface";

// Use .nullable() to allow null values

export const TextObjectSchema = z.object({
  type: z.string(),
  language: z.string(),
  text: z.string(),
});

export const URLSchema = z.object({
  type: z.string(),
  url: z.string().url(),
});

export const ImageSchema = z.object({
  path: z.string().url(),
  extension: z.string(),
});

export const ComicDateSchema = z.object({
  type: z.string(),
  date: z.string().datetime({ offset: true }),
});

export const ComicPriceSchema = z.object({
  type: z.string(),
  price: z.number(),
});

export const SummarySchema = z.object({
  id: z.number().default(0),
  resourceURI: z.string(),
  name: z.string(),
});

export const RoleSummarySchema = SummarySchema.extend({
  role: z.string().nullable().optional(),
});

export const TypeSummarySchema = SummarySchema.extend({
  type: z.string(),
});

export const ComicSummarySchema = SummarySchema;

export const StorySummarySchema = TypeSummarySchema;

export const SeriesSummarySchema = SummarySchema;

export const CreatorSummarySchema = RoleSummarySchema;

export const CharacterSummarySchema = RoleSummarySchema;

export const EventSummarySchema = SummarySchema;

export const ListSchema = z.object({
  available: z.number(),
  returned: z.number(),
  collectionURI: z.string().url(),
  items: z.array(SummarySchema),
});

export const ComicListSchema = ListSchema.extend({
  items: z.array(ComicSummarySchema),
});

export const StoryListSchema = ListSchema.extend({
  items: z.array(StorySummarySchema),
});

export const SeriesListSchema = ListSchema.extend({
  items: z.array(SeriesSummarySchema),
});

export const EventListSchema = ListSchema.extend({
  items: z.array(EventSummarySchema),
});

export const CreatorListSchema = ListSchema.extend({
  items: z.array(CreatorSummarySchema),
});

export const CharacterListSchema = ListSchema.extend({
  items: z.array(RoleSummarySchema),
});

export const MarvelResultSchema = z.object({
  id: z.number(),
  modified: z.string().datetime({ offset: true }),
  resourceURI: z.string().url(),
  urls: z.array(URLSchema).nullable().optional(),
  thumbnail: ImageSchema.nullable().optional(),
});

export const MarvelComicSchema = MarvelResultSchema.extend({
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
  format: z.string().nullable().optional().default("Unknown"),
  pageCount: z.number().default(0),
  textObjects: z.array(TextObjectSchema),
  series: SeriesSummarySchema,
  variants: z.array(ComicSummarySchema),
  collections: z.array(ComicSummarySchema),
  collectedIssues: z.array(ComicSummarySchema),
  dates: z.array(ComicDateSchema),
  prices: z.array(ComicPriceSchema),
  images: z.array(ImageSchema),
  creators: CreatorListSchema,
  characters: CharacterListSchema,
  stories: StoryListSchema,
  events: EventListSchema,
});

export const MarvelEventSchema = MarvelResultSchema.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }).nullable().optional(),
  comics: ComicListSchema,
  stories: StoryListSchema,
  series: SeriesListSchema,
  characters: CharacterListSchema,
  creators: CreatorListSchema,
  next: EventSummarySchema.nullable().optional(),
  previous: EventSummarySchema.nullable().optional(),
});

export const MarvelSeriesSchema = MarvelResultSchema.extend({
  title: z.string(),
  description: z.union([z.string(), z.null()]).nullable().optional(),
  startYear: z.string().or(z.number()),
  endYear: z.number().or(z.number()),
  rating: z.string(),
  comics: ComicListSchema,
  stories: StoryListSchema,
  events: EventListSchema,
  characters: CharacterListSchema,
  creators: CreatorListSchema,
  next: SeriesSummarySchema.nullable().optional(),
  previous: SeriesSummarySchema.nullable().optional(),
});

export const MarvelCreatorSchema = MarvelResultSchema.extend({
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  suffix: z.string().nullable().optional(),
  fullName: z.string(),
  series: SeriesListSchema,
  stories: StoryListSchema,
  comics: ComicListSchema,
  events: EventListSchema,
});

export const MarvelCharacterSchema = MarvelResultSchema.extend({
  name: z.string(),
  description: z.string().nullable().optional(),
  comics: ComicListSchema,
  stories: StoryListSchema,
  events: EventListSchema,
  series: SeriesListSchema,
});

export const MarvelStorySchema = MarvelResultSchema.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  comics: ComicListSchema,
  series: SeriesListSchema,
  events: EventListSchema,
  characters: CharacterListSchema,
  creators: CreatorListSchema,
  originalissue: ComicSummarySchema.nullable().optional(),
});

export const MarvelResultsSchema = z.array(MarvelResultSchema);
export const MarvelComicsSchema = z.array(MarvelComicSchema);
export const MarvelEventsSchema = z.array(MarvelEventSchema);
export const MarvelSeriesListSchema = z.array(MarvelSeriesSchema);
export const MarvelCreatorsSchema = z.array(MarvelCreatorSchema);
export const MarvelCharactersSchema = z.array(MarvelCharacterSchema);
export const MarvelStoriesSchema = z.array(MarvelStorySchema);

export const ResultSchemaMap: EndpointMap<z.ZodType> = {
  comics: MarvelComicsSchema,
  events: MarvelEventsSchema,
  series: MarvelSeriesListSchema,
  creators: MarvelCreatorsSchema,
  characters: MarvelCharactersSchema,
  stories: MarvelStoriesSchema,
};
