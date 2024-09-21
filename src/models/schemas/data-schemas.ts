import { z } from "zod";
import { EndpointMap } from "../types/endpoint-types";
import { FormatSchema, YearSchema } from "./schema-utilities";
import { EndpointType } from "lib";

// Use .nullable() to allow null values

/** For some unknown reason, the start and end dates of Events are in a different format than the rest of the data */
const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const DateTimeSchema = z
  .string()
  .regex(
    dateTimeRegex,
    "Invalid date-time format. Expected format: YYYY-MM-DD HH:MM:SS"
  );

export const TextObjectSchema = z.object({
  type: z
    .string(),
  language: z
    .string(),
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

export const ComicSummarySchema = SummarySchema.extend({
  resourceURI: z.string().regex(/^https:\/\/gateway\.marvel\.com\/v1\/public\/comics\/\d{1,10}$/),
});

export const StorySummarySchema = TypeSummarySchema.extend({
  resourceURI: z.string().regex(/^https:\/\/gateway\.marvel\.com\/v1\/public\/stories\/\d{1,10}$/),
});;

export const SeriesSummarySchema = SummarySchema.extend({
  resourceURI: z.string().regex(/^https:\/\/gateway\.marvel\.com\/v1\/public\/series\/\d{1,10}$/),
});

export const CreatorSummarySchema = RoleSummarySchema.extend({
  resourceURI: z.string().regex(/^https:\/\/gateway\.marvel\.com\/v1\/public\/creators\/\d{1,10}$/),
});

export const CharacterSummarySchema = RoleSummarySchema.extend({
  resourceURI: z.string().regex(/^https:\/\/gateway\.marvel\.com\/v1\/public\/characters\/\d{1,10}$/),
});

export const EventSummarySchema = SummarySchema.extend({
  resourceURI: z.string().regex(/^https:\/\/gateway\.marvel\.com\/v1\/public\/events\/\d{1,10}$/),
});

export const ListSchema = z.object({
  available: z.number(),
  returned: z
    .number(),
  collectionURI: z.string().url(),
  items: z.array(SummarySchema),
});

const Collection = (typeA: EndpointType, typeB: EndpointType, schema: z.AnyZodObject) => schema.extend({
  collectionURI: z.string().regex(new RegExp(`^https://gateway.marvel.com/v1/public/${typeA}/\\d{1,10}/${typeB}$`)),
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
  issueNumber: z
    .number()
    .default(0),
  variantDescription: z.string().nullable().optional(),
  description: z
    .string()
    .nullable()
    .optional(),
  isbn: z
    .string()
    .nullable()
    .optional(),
  upc: z
    .string()
    .nullable()
    .optional(),
  diamondCode: z.string().nullable().optional(),
  ean: z.string().nullable().optional(),
  issn: z.string().nullable().optional(),
  format: FormatSchema.nullable(),
  pageCount: z.number().default(0),
  textObjects: z.array(TextObjectSchema),
  series: SeriesSummarySchema,
  variants: z
    .array(ComicSummarySchema),
  collections: z
    .array(ComicSummarySchema),
  collectedIssues: z
    .array(ComicSummarySchema),
  dates: z.array(ComicDateSchema),
  prices: z.array(ComicPriceSchema),
  urls: z.array(URLSchema).nullable().optional(),
  images: z.array(ImageSchema),
  creators: Collection("comics", "creators", CreatorListSchema),
  characters: Collection("comics", "characters", CharacterListSchema),
  stories: Collection("comics", "stories", StoryListSchema),
  events: Collection("comics", "events", EventListSchema),
});

export const MarvelEventSchema = MarvelResultSchema.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  start: DateTimeSchema,
  end: DateTimeSchema,
  comics: Collection("events", "comics", ComicListSchema),
  stories: Collection("events", "stories", StoryListSchema),
  series: Collection("events", "series", SeriesListSchema),
  characters: Collection("events", "characters", CharacterListSchema),
  creators: Collection("events", "creators", CreatorListSchema),
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
  comics: Collection("series", "comics", ComicListSchema),
  stories: Collection("series", "stories", StoryListSchema),
  events: Collection("series", "events", EventListSchema),
  characters: Collection("series", "characters", CharacterListSchema),
  creators: Collection("series", "creators", CreatorListSchema),
  urls: z.array(URLSchema).nullable().optional(),
  next: SeriesSummarySchema.nullable().optional(),
  previous: SeriesSummarySchema.nullable().optional(),
});

export const MarvelCreatorSchema = MarvelResultSchema.extend({
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  suffix: z.string().nullable().optional(),
  fullName: z.string(),
  urls: z.array(URLSchema).nullable().optional(),
  series: Collection("creators", "series", SeriesListSchema),
  stories: Collection("creators", "stories", StoryListSchema),
  comics: Collection("creators", "comics", ComicListSchema),
  events: Collection("creators", "events", EventListSchema),
});

export const MarvelCharacterSchema = MarvelResultSchema.extend({
  name: z.string(),
  description: z.string().nullable().optional(),
  urls: z.array(URLSchema).nullable().optional(),
  comics: Collection("characters", "comics", ComicListSchema),
  stories: Collection("characters", "stories", StoryListSchema),
  events: Collection("characters", "events", EventListSchema),
  series: Collection("characters", "series", SeriesListSchema),
});

export const MarvelStorySchema = MarvelResultSchema.extend({
  title: z.string(),
  description: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  comics: Collection("stories", "comics", ComicListSchema),
  series: Collection("stories", "series", SeriesListSchema),
  events: Collection("stories", "events", EventListSchema),
  characters: Collection("stories", "characters", CharacterListSchema),
  creators: Collection("stories", "creators", CreatorListSchema),
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
