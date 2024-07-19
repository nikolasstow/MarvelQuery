import { z } from "zod";
import { EndpointMap } from "../types/utility-types";

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
  isbn: z
    .string()
    .nullable()
    .optional()
    .describe(
      "The ISBN for the comic (generally only populated for collection formats)."
    ),
  upc: z
    .string()
    .nullable()
    .optional()
    .describe(
      "The UPC barcode number for the comic (generally only populated for periodical formats)."
    ),
  diamondCode: z
    .string()
    .nullable()
    .optional()
    .describe("The Diamond code for the comic."),
  ean: z
    .string()
    .nullable()
    .optional()
    .describe("The EAN barcode for the comic."),
  issn: z
    .string()
    .nullable()
    .optional()
    .describe("The ISSN barcode for the comic."),
  format: z
    .string()
    .nullable()
    .optional()
    .default("Unknown")
    .describe(
      "The format of the comic e.g. comic, digital comic, hardcover, trade paperback."
    ),
  pageCount: z
    .number()
    .default(0)
    .describe("The number of pages in the comic."),
  textObjects: z
    .array(TextObjectSchema)
    .describe("A set of descriptive text blurbs for the comic."),
  series: SeriesSummarySchema.describe(
    "A summary representation of the series to which this comic belongs."
  ),
  variants: z
    .array(ComicSummarySchema)
    .describe(
      `A list of variant issues for this comic (includes the "original" issue if the current issue is a variant).`
    ),
  collections: z
    .array(ComicSummarySchema)
    .describe(
      "A list of collections which include this comic (will generally be empty if the comic's format is a collection)."
    ),
  collectedIssues: z
    .array(ComicSummarySchema)
    .describe(
      `A list of issues collected in this comic (will generally be empty for periodical formats such as "comic" or "magazine"`
    ),
  dates: z
    .array(ComicDateSchema)
    .describe("A list of key dates for this comic."),
  prices: z
    .array(ComicPriceSchema)
    .describe("A list of prices for this comic."),
  urls: z
    .array(URLSchema)
    .nullable()
    .optional()
    .describe("A set of public web site URLs for the resource."),
  images: z
    .array(ImageSchema)
    .describe("A list of promotional images associated with this comic."),
  creators: CreatorListSchema.describe(
    "A resource list containing the creators associated with this comic."
  ),
  characters: CharacterListSchema.describe(
    "A resource list containing the characters in this comic."
  ),
  stories: StoryListSchema.describe(
    "A resource list containing the stories which appear in this comic."
  ),
  events: EventListSchema.describe(
    "A resource list containing the events in which this comic appears."
  ),
});

export const MarvelEventSchema = MarvelResultSchema.extend({
  title: z.string().describe("The title of the event."),
  description: z
    .string()
    .nullable()
    .optional()
    .describe("A description of the event."),
  start: DateTimeSchema // In "YYYY-MM-DD HH:MM:SS" format rather than the standard ISO 8601 format which separates date and time with a 'T' rather than a space.
    .describe("The date of publication of the first issue in this event."),
  end: DateTimeSchema // In "YYYY-MM-DD HH:MM:SS" format rather than the standard ISO 8601 format. WHY Marvel?
    .describe("The date of publication of the last issue in this event."),
  comics: ComicListSchema.describe(
    "A resource list containing the comics in this event."
  ),
  stories: StoryListSchema.describe(
    "A resource list containing the stories in this event."
  ),
  series: SeriesListSchema.describe(
    "A resource list containing the series in this event."
  ),
  characters: CharacterListSchema.describe(
    "A resource list containing the characters which appear in this event."
  ),
  creators: CreatorListSchema.describe(
    "A resource list containing creators whose work appears in this event."
  ),
  urls: z
    .array(URLSchema)
    .nullable()
    .optional()
    .describe("A set of public web site URLs for the event."),
  next: EventSummarySchema.nullable()
    .optional()
    .describe(
      "A summary representation of the event which follows this event in the timeline."
    ),
  previous: EventSummarySchema.nullable()
    .optional()
    .describe(
      "A summary representation of the event which preceded this event in the timeline."
    ),
});

export const MarvelSeriesSchema = MarvelResultSchema.extend({
  title: z.string().describe("The canonical title of the series."),
  description: z
    .union([z.string(), z.null()])
    .nullable()
    .optional()
    .describe("A description of the series."),
  startYear: z
    .string()
    .or(z.number())
    .describe("The first year in which the series has been published."),
  endYear: z
    .number()
    .or(z.number())
    .describe(
      "The last year of publication for the series (conventionally, 2099 for ongoing series)."
    ),
  rating: z.string().describe("The age-appropriateness rating for the series."),
  comics: ComicListSchema.describe(
    "A resource list containing comics in this series."
  ),
  stories: StoryListSchema.describe(
    "A resource list containing stories which occur in comics in this series."
  ),
  events: EventListSchema.describe(
    "A resource list containing events which take place in comics in this series."
  ),
  characters: CharacterListSchema.describe(
    "A resource list containing the characters which appear in this series."
  ),
  creators: CreatorListSchema.describe(
    "A resource list containing creators whose work appears in this series."
  ),
  urls: z
    .array(URLSchema)
    .nullable()
    .optional()
    .describe("A set of public web site URLs for this series."),
  next: SeriesSummarySchema.nullable()
    .optional()
    .describe(
      "A summary representation of the series which follows this series in the timeline."
    ),
  previous: SeriesSummarySchema.nullable()
    .optional()
    .describe(
      "A summary representation of the series which preceded this series in the timeline."
    ),
});

export const MarvelCreatorSchema = MarvelResultSchema.extend({
  firstName: z.string().describe("The first name of the creator."),
  middleName: z
    .string()
    .nullable()
    .optional()
    .describe("The middle name of the creator."),
  lastName: z.string().describe("The last name of the creator."),
  suffix: z
    .string()
    .nullable()
    .optional()
    .describe("The suffix or honorific for the creator."),
  fullName: z
    .string()
    .describe(
      "The full name of the creator (a space-separated concatenation of the above four fields)."
    ),
  urls: z
    .array(URLSchema)
    .nullable()
    .optional()
    .describe("A set of public web site URLs for the creator."),
  series: SeriesListSchema.describe(
    "A resource list containing the series which feature works by this creator."
  ),
  stories: StoryListSchema.describe(
    "A resource list containing the stories which feature work by this creator."
  ),
  comics: ComicListSchema.describe(
    "A resource list containing the comics which feature works by this creator."
  ),
  events: EventListSchema.describe(
    "A resource list containing the events which feature works by this creator."
  ),
});

export const MarvelCharacterSchema = MarvelResultSchema.extend({
  name: z.string().describe("The name of the character."),
  description: z
    .string()
    .nullable()
    .optional()
    .describe("A short bio or description of the character."),
  urls: z
    .array(URLSchema)
    .nullable()
    .optional()
    .describe("A set of public web site URLs for the character."),
  comics: ComicListSchema.describe(
    "A resource list containing comics which feature this character."
  ),
  stories: StoryListSchema.describe(
    "A resource list containing the stories in which this character appears."
  ),
  events: EventListSchema.describe(
    "A resource list containing events in which this character appears."
  ),
  series: SeriesListSchema.describe(
    "A resource list containing series in which this character appears."
  ),
});

export const MarvelStorySchema = MarvelResultSchema.extend({
  title: z.string().describe("The title of the story."),
  description: z
    .string()
    .nullable()
    .optional()
    .describe("A description of the story."),
  type: z
    .string()
    .nullable()
    .optional()
    .describe("The story type e.g. interior story, cover, text story."),
  comics: ComicListSchema.describe(
    "A resource list containing comics in which this story takes place."
  ),
  series: SeriesListSchema.describe(
    "A resource list containing series in which this story appears."
  ),
  events: EventListSchema.describe(
    "A resource list containing events in which this story appears."
  ),
  characters: CharacterListSchema.describe(
    "A resource list containing characters which appear in this story."
  ),
  creators: CreatorListSchema.describe(
    "A resource list of creators who worked on this story."
  ),
  originalissue: ComicSummarySchema.nullable()
    .optional()
    .describe(
      "A summary representation of the issue in which this story was originally published."
    ),
});

export const MarvelResultsSchema = z
  .array(MarvelResultSchema)
  .describe("An array of results returned by the API.");
export const MarvelComicsSchema = z
  .array(MarvelComicSchema)
  .describe("An array of Comics returned by the API.");
export const MarvelEventsSchema = z
  .array(MarvelEventSchema)
  .describe("An array of Events returned by the API.");
export const MarvelSeriesListSchema = z
  .array(MarvelSeriesSchema)
  .describe("An array of Series returned by the API.");
export const MarvelCreatorsSchema = z
  .array(MarvelCreatorSchema)
  .describe("An array of Creators returned by the API.");
export const MarvelCharactersSchema = z
  .array(MarvelCharacterSchema)
  .describe("An array of Characters returned by the API.");
export const MarvelStoriesSchema = z
  .array(MarvelStorySchema)
  .describe("An array of Stories returned by the API.");

/** Schema Map for results, keyed by type */
export const ResultSchemaMap: EndpointMap<z.ZodType> = {
  comics: MarvelComicsSchema,
  events: MarvelEventsSchema,
  series: MarvelSeriesListSchema,
  creators: MarvelCreatorsSchema,
  characters: MarvelCharactersSchema,
  stories: MarvelStoriesSchema,
};
