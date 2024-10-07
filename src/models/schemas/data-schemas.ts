import { z } from "zod";
import { EndpointMap } from "../types/endpoint-types";
import { YearSchema } from "./schema-utilities";

// API Wrapper Schema
export const APIWrapperSchema = z.object({
  code: z.number(),
  status: z.string(),
  copyright: z.string(),
  attributionText: z.string(),
  attributionHTML: z.string(),
  etag: z.string(),
  data: z.object({
    offset: z.number(),
    limit: z.number(),
    total: z.number(),
    count: z.number(),
    results: z.array(z.any()), // Adjust the schema for MarvelResult if needed
  }),
});

/** Schemas of the building blocks that form to create the different data types. */

/** For some unknown reason, the start and end dates of Events are in a different format than the rest of the data */
const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const DateTimeSchema = z
  .string()
  .regex(
    dateTimeRegex,
    "Invalid date-time format. Expected format: YYYY-MM-DD HH:MM:SS"
  );

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
  date: z.string(),
});

export const ComicPriceSchema = z.object({
  type: z.string(),
  price: z.number(),
});

/** Schemas for "Summaries", resources related to the return data */

export const SummarySchema = z.object({
  resourceURI: z.string().url(),
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

/** Schema's for "Lists", collections related to the data object they are found in.
 * Collected in the items array are the summaries of the related resources.
 */

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
  items: z.array(CharacterSummarySchema),
});

/** Base schema upon which all data types are built. */

export const MarvelResultSchema = z.object({
  id: z.number(),
  modified: z.string(),
  // .datetime({ offset: true }) // Marvel for some reason defaults to November 30th, 1 BC and that fails validation because it's essentially a negative date. Seriously? Marvel?
  resourceURI: z.string().url(),
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
  format: z.string().nullable().optional(),
  pageCount: z.number().default(0),
  textObjects: z.array(TextObjectSchema),
  series: SeriesSummarySchema,
  variants: z.array(ComicSummarySchema),
  collections: z.array(ComicSummarySchema),
  collectedIssues: z.array(ComicSummarySchema),
  dates: z.array(ComicDateSchema),
  prices: z.array(ComicPriceSchema),
  urls: z.array(URLSchema).nullable().optional(),
  images: z.array(ImageSchema),
  creators: CreatorListSchema,
  characters:  CharacterListSchema,
  stories: StoryListSchema,
  events: EventListSchema,
});

export const MarvelEventSchema = MarvelResultSchema.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  start: DateTimeSchema.nullable().optional(),
  end: DateTimeSchema.nullable().optional(),
  comics: ComicListSchema,
  stories: StoryListSchema,
  series: SeriesListSchema,
  characters: CharacterListSchema,
  creators: CreatorListSchema,
  urls: z.array(URLSchema).nullable().optional(),
  next: EventSummarySchema.nullable().optional(),
  previous: EventSummarySchema.nullable().optional(),
});

export const MarvelSeriesSchema = MarvelResultSchema.extend({
  title: z.string(),
  description: z.union([z.string(), z.null()]).nullable().optional(),
  startYear: YearSchema,
  endYear: z.union([YearSchema, z.literal(2099)]),
  rating: z.string(),
  comics: ComicListSchema,
  stories: StoryListSchema,
  events: EventListSchema,
  characters: CharacterListSchema,
  creators: CreatorListSchema,
  urls: z.array(URLSchema).nullable().optional(),
  next: SeriesSummarySchema.nullable().optional(),
  previous: SeriesSummarySchema.nullable().optional(),
});

export const MarvelCreatorSchema = MarvelResultSchema.extend({
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.union([z.string(), z.number()]),
  suffix: z.string().nullable().optional(),
  fullName: z.string(),
  urls: z.array(URLSchema).nullable().optional(),
  series: SeriesListSchema,
  stories: StoryListSchema,
  comics: ComicListSchema,
  events: EventListSchema,
});

export const MarvelCharacterSchema = MarvelResultSchema.extend({
  name: z.string(),
  description: z.string().nullable().optional(),
  urls: z.array(URLSchema).nullable().optional(),
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
  originalIssue: ComicSummarySchema.nullable().optional(),
});

/** Schema Map for results, keyed by type */
export const ResultSchemaMap: EndpointMap<z.ZodType> = {
  comics: MarvelComicSchema,
  events: MarvelEventSchema,
  series: MarvelSeriesSchema,
  creators: MarvelCreatorSchema,
  characters: MarvelCharacterSchema,
  stories: MarvelStorySchema,
};
