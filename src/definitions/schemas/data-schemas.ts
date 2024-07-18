import { z } from "zod";
import { EndpointMap } from "../types/api-interface";

// Use .nullable() to allow null values

export const TextObjectSchema = z.object({
  type: z
    .string()
    .describe(
      "The canonical type of the text object (e.g. solicit text, preview text, etc.)."
    ),
  language: z
    .string()
    .describe(
      "The IETF language tag denoting the language the text object is written in."
    ),
  text: z.string().describe("The text."),
});

export const URLSchema = z.object({
  type: z.string().describe("A text identifier for the URL."),
  url: z
    .string()
    .url()
    .describe("A full URL (including scheme, domain, and path)."),
});

export const ImageSchema = z.object({
  path: z.string().url().describe("The directory path of to the image."),
  extension: z.string().describe("The file extension for the image."),
});

export const ComicDateSchema = z.object({
  type: z
    .string()
    .describe("A description of the date (e.g. onsale date, FOC date)."),
  date: z.string().datetime({ offset: true }).describe("The date."),
});

export const ComicPriceSchema = z.object({
  type: z
    .string()
    .describe("A description of the price (e.g. print price, digital price)."),
  price: z.number().describe("The price (all prices in USD)."),
});

export const SummarySchema = z.object({
  resourceURI: z
    .string()
    .describe("The path to the individual summary resource."),
  name: z.string().describe("The canonical name of the summary."),
});

export const RoleSummarySchema = SummarySchema.extend({
  role: z
    .string()
    .nullable()
    .optional()
    .describe("The role of the person in the parent entity."),
});

export const TypeSummarySchema = SummarySchema.extend({
  type: z.string().describe("The type of the entity."),
});

export const ComicSummarySchema = SummarySchema;

export const StorySummarySchema = TypeSummarySchema;

export const SeriesSummarySchema = SummarySchema;

export const CreatorSummarySchema = RoleSummarySchema;

export const CharacterSummarySchema = RoleSummarySchema;

export const EventSummarySchema = SummarySchema;

export const ListSchema = z.object({
  available: z.number().describe("The number of total results available."),
  returned: z
    .number()
    .describe(
      "The number of resources returned in this collection. (up to 20)"
    ),
  collectionURI: z
    .string()
    .url()
    .describe("The path to the full list of issues in this collection."),
  items: z
    .array(SummarySchema)
    .describe("The list of returned resources in this collection."),
});

export const ComicListSchema = ListSchema.extend({
  items: z
    .array(ComicSummarySchema)
    .describe("The list of returned issues in this collection."),
});

export const StoryListSchema = ListSchema.extend({
  items: z
    .array(StorySummarySchema)
    .describe("The list of returned stories in this collection."),
});

export const SeriesListSchema = ListSchema.extend({
  items: z
    .array(SeriesSummarySchema)
    .describe("The list of returned series in this collection."),
});

export const EventListSchema = ListSchema.extend({
  items: z
    .array(EventSummarySchema)
    .describe("The list of returned events in this collection."),
});

export const CreatorListSchema = ListSchema.extend({
  items: z
    .array(CreatorSummarySchema)
    .describe("The list of returned creators in this collection."),
});

export const CharacterListSchema = ListSchema.extend({
  items: z
    .array(RoleSummarySchema)
    .describe("The list of returned characters in this collection."),
});

export const MarvelResultSchema = z.object({
  id: z.number().describe("The unique ID of the resource."),
  modified: z
    .string()
    .datetime({ offset: true })
    .describe("The date the resource was most recently modified."),
  resourceURI: z
    .string()
    .url()
    .describe("The canonical URL identifier for this resource."),
  thumbnail: ImageSchema.nullable()
    .optional()
    .describe("The representative image for this resource."),
});

export const MarvelComicSchema = MarvelResultSchema.extend({
  digitalId: z
    .number()
    .nullable()
    .optional()
    .describe("The ID of the digital comic representation of this comic."),
  title: z.string().describe("The title of the comic."),
  issueNumber: z
    .number()
    .default(0)
    .describe(
      "The issue number of the comic on the original publisher's website."
    ),
  variantDescription: z
    .string()
    .nullable()
    .optional()
    .describe("If the issue is a variant (vs. the parent issue)."),
  description: z
    .string()
    .nullable()
    .optional()
    .describe(
      "The description of the issue in plaintext. HTML tags are stripped away from the result."
    ),
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
  urls: z.array(URLSchema).nullable().optional(),
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
  urls: z.array(URLSchema).nullable().optional(),
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
