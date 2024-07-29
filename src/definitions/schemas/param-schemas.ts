import { z } from "zod";
import {
  DateRangeSchema,
  IDListSchema,
  ModifiedSince,
  OrderBy,
  YearSchema,
  FormatSchema,
  FormatsSchema,
} from "./schema-utilities";
import { EndpointMap } from "../types";

export const APISchema = z.object({
  modifiedSince: ModifiedSince.optional().describe(
    "Only return objects created or changed since the specified date. (format: YYYY-MM-DD)"
  ),
  limit: z
    .number()
    .positive()
    .default(100)
    .optional()
    .describe("Limit the number of results returned."),
  offset: z
    .number()
    .nonnegative()
    .default(0)
    .optional()
    .describe("Skip the specified number of results."),
});

export const CharactersSchema = APISchema.extend({
  name: z
    .string()
    .optional()
    .describe(
      "Return only characters matching the specified full character name (e.g. Spider-Man)."
    ),
  nameStartsWith: z
    .string()
    .optional()
    .describe(
      "Return only characters with names that begin with the specified string (e.g. Sp)."
    ),
  comics: IDListSchema.optional().describe(
    "Return only characters which appear in the specified comics (accepts a comma-separated list of ids)."
  ),
  series: IDListSchema.optional().describe(
    "Return only characters which appear in the specified series (accepts a comma-separated list of ids)."
  ),
  events: IDListSchema.optional().describe(
    "Return only characters which appear in the specified events (accepts a comma-separated list of ids)."
  ),
  stories: IDListSchema.optional().describe(
    "Return only characters which appear in the specified stories (accepts a comma-separated list of ids)."
  ),
  orderBy: OrderBy("characters")
    .optional()
    .describe(
      `Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.`
    ),
});

const FormatTypeSchema = z.enum(["comic", "collection"]);
export const DateDescriptorSchema = z.enum([
  "lastWeek",
  "thisWeek",
  "nextWeek",
  "thisMonth",
]);

export const ComicsSchema = APISchema.extend({
  format: FormatSchema.optional().describe(
    "Filter by format (e.g. comic, digital comic, trade paperback)."
  ),
  formatType: FormatTypeSchema.optional().describe(
    "Filter by the issue format type (comic or collection)."
  ),
  noVariants: z
    .boolean()
    .optional()
    .describe(
      "Exclude variants (alternate covers, secondary printings, director's cuts, etc.) from the result set."
    ),
  dateDescriptor: DateDescriptorSchema.optional().describe(
    "Return comics within a predefined date range (eg. lastWeek, thisWeek, nextWeek, thisMonth)."
  ),
  dateRange: DateRangeSchema.optional().describe(
    "Return comics within a predefined date range. Dates must be specified as date1,date2 (e.g. 2013-01-01,2013-01-02). Dates are preferably formatted as YYYY-MM-DD but may be sent as any common date format."
  ),
  title: z
    .string()
    .optional()
    .describe("Return only issues in series whose title matches the input."),
  titleStartsWith: z
    .string()
    .optional()
    .describe(
      "Return only issues in series whose title starts with the input."
    ),
  startYear: YearSchema.optional().describe(
    "Return only issues in series whose start year matches the input."
  ),
  issueNumber: z
    .number()
    .nonnegative()
    .optional()
    .describe(
      "Return only issues in series whose issue number matches the input."
    ),
  diamondCode: z.string().optional().describe("Filter by diamond code."),
  digitalId: z.number().optional().describe("Filter by digital comic id."),
  upc: z.string().optional().describe("Filter by UPC."),
  isbn: z.string().optional().describe("Filter by ISBN."),
  ean: z.string().optional().describe("Filter by EAN."),
  issn: z.string().optional().describe("Filter by ISSN."),
  hasDigitalIssue: z
    .boolean()
    .optional()
    .describe("Filter by having digital rights."),
  creators: IDListSchema.optional().describe(
    "Return only issues which have one or more of the specified creators (accepts a comma-separated list of ids)."
  ),
  characters: IDListSchema.optional().describe(
    "Return only issues containing the specified creators (accepts a comma-separated list of ids)."
  ),
  series: IDListSchema.optional().describe(
    "Return only issues which appear in the specified series (accepts a comma-separated list of ids)."
  ),
  events: IDListSchema.optional().describe(
    "Return only issues which appear in the specified events (accepts a comma-separated list of ids)."
  ),
  stories: IDListSchema.optional().describe(
    "Return only issues which contain the specified stories (accepts a comma-separated list of ids)."
  ),
  sharedAppearances: IDListSchema.optional().describe(
    "Return only issues in which the specified characters appear together (for example in which both Spider-Man and Gamora appear). Accepts a comma-separated list of ids."
  ),
  collaborators: IDListSchema.optional().describe(
    "Return only issues in which the specified creators worked together (for example in which both Brian Bendis and Stan Lee did work). Accepts a comma-separated list of ids."
  ),
  orderBy: OrderBy("comics")
    .optional()
    .describe(
      `Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.`
    ),
});

export const CreatorsSchema = APISchema.extend({
  firstName: z
    .string()
    .optional()
    .describe("Filter by creator first name (e.g. Brian)."),
  middleName: z
    .string()
    .optional()
    .describe("Filter by creator middle name (e.g. Michael)."),
  lastName: z
    .string()
    .optional()
    .describe("Filter by creator last name (e.g. Bendis)."),
  suffix: z
    .string()
    .optional()
    .describe("Filter by suffix or honorific (e.g. Jr., Sr.)."),
  nameStartsWith: z
    .string()
    .optional()
    .describe("Filter by creator names that match critera (e.g. B, St L)."),
  firstNameStartsWith: z
    .string()
    .optional()
    .describe(
      "Filter by creator first names that match critera (e.g. B, St L)."
    ),
  middleNameStartsWith: z
    .string()
    .optional()
    .describe("Filter by creator middle names that match critera (e.g. Mi)."),
  lastNameStartsWith: z
    .string()
    .optional()
    .describe("Filter by creator last names that match critera (e.g. Ben)."),
  comics: IDListSchema.optional().describe(
    "Return only creators who worked on in the specified comics (accepts a comma-separated list of ids)."
  ),
  series: IDListSchema.optional().describe(
    "Return only creators who worked on the specified series (accepts a comma-separated list of ids)."
  ),
  events: IDListSchema.optional().describe(
    "Return only creators who worked on comics that took place in the specified events (accepts a comma-separated list of ids)."
  ),
  stories: IDListSchema.optional().describe(
    "Return only creators who worked on the specified stories (accepts a comma-separated list of ids)."
  ),
  orderBy: OrderBy("creators")
    .optional()
    .describe(
      `Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.`
    ),
});

export const EventsSchema = APISchema.extend({
  name: z
    .string()
    .optional()
    .describe("Return only events which match the specified name."),
  nameStartsWith: z
    .string()
    .optional()
    .describe("Return only events which match the specified name."),
  creators: IDListSchema.optional().describe(
    "Return only events which have one or more of the specified creators (accepts a comma-separated list of ids)."
  ),
  characters: IDListSchema.optional().describe(
    "Return only events which feature the specified characters (accepts a comma-separated list of ids)."
  ),
  series: IDListSchema.optional().describe(
    "Return only events which are part of the specified series (accepts a comma-separated list of ids)."
  ),
  comics: IDListSchema.optional().describe(
    "Return only events which take place in the specified comics (accepts a comma-separated list of ids)."
  ),
  stories: IDListSchema.optional().describe(
    "Return only events which take place in the specified stories (accepts a comma-separated list of ids)."
  ),
  orderBy: OrderBy("events")
    .optional()
    .describe(
      `Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.`
    ),
});

export const SeriesSchema = APISchema.extend({
  title: z
    .string()
    .optional()
    .describe("Return only series which match the specified title."),
  titleStartsWith: z
    .string()
    .optional()
    .describe(
      "Return series with titles that begin with the specified string (e.g. Sp)."
    ),
  startYear: YearSchema.optional().describe(
    "Return only series matching the specified start year."
  ),
  comics: IDListSchema.optional().describe(
    "Return only series which appear in the specified comics (accepts a comma-separated list of ids)."
  ),
  stories: IDListSchema.optional().describe(
    "Return only series which contain the specified stories (accepts a comma-separated list of ids). "
  ),
  events: IDListSchema.optional().describe(
    "Return only series which have comics that take place during the specified events (accepts a comma-separated list of ids)."
  ),
  creators: IDListSchema.optional().describe(
    "Return only series which feature work by the specified creators (accepts a comma-separated list of ids)."
  ),
  characters: IDListSchema.optional().describe(
    "Return only series which feature the specified characters (accepts a comma-separated list of ids)."
  ),
  seriesType: z
    .enum(["collection", "one shot", "limited", "ongoing"])
    .optional()
    .describe(
      "Filter the series by publication frequency type (e.g. collection, one shot, limited, ongoing)."
    ),
  contains: FormatsSchema.optional().describe(
    "Return only series containing one or more comics with the specified format."
  ),
  orderBy: OrderBy("series")
    .optional()
    .describe(
      `Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.`
    ),
});

export const StoriesSchema = APISchema.extend({
  comics: IDListSchema.optional().describe(
    "Return only stories which appear in the specified comics (accepts a comma-separated list of ids)."
  ),
  series: IDListSchema.optional().describe(
    "Return only stories which are part of the specified series (accepts a comma-separated list of ids)."
  ),
  events: IDListSchema.optional().describe(
    "Return only stories which take place during the specified events (accepts a comma-separated list of ids)."
  ),
  creators: IDListSchema.optional().describe(
    "Return only stories which feature work by the specified creators (accepts a comma-separated list of ids)."
  ),
  characters: IDListSchema.optional().describe(
    "Return only stories which feature the specified characters (accepts a comma-separated list of ids)."
  ),
  orderBy: OrderBy("stories")
    .optional()
    .describe(
      `Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.`
    ),
});

const dataTypes = z
  .enum(["comics", "characters", "creators", "events", "stories", "series"])
  .describe("A data type used in the endpoint.");

export const EndpointSchema = z.tuple([
  dataTypes.describe(
    "The data type of the subject of the query, e.g. 'comics'."
  ),
  z.number().optional().describe("The ID of the subject of the query."),
  dataTypes.optional().describe("The data type returned by the query."),
]);

export const ParameterSchema = z.union([
  CharactersSchema,
  ComicsSchema,
  CreatorsSchema,
  EventsSchema,
  SeriesSchema,
  StoriesSchema,
]);

/** Validation schemas for each endpoint parameters */
export const ValidateParams: EndpointMap<z.ZodType> = {
  characters: CharactersSchema,
  comics: ComicsSchema,
  creators: CreatorsSchema,
  events: EventsSchema,
  series: SeriesSchema,
  stories: StoriesSchema,
};
