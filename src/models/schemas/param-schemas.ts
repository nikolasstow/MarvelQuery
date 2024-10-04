import { z } from "zod";
import {
  DateRangeSchema,
  IDListSchema,
  ModifiedSince,
  OrderBy,
  YearSchema,
  FormatsSchema,
} from "./schema-utilities";
import { EndpointMap } from "../types/endpoint-types";

// Schema of parameters that are common to all endpoints
export const APISchema = z.object({
  modifiedSince: ModifiedSince.optional(),
  limit: z.number().positive().default(100).optional(),
  offset: z.number().nonnegative().default(0).optional(),
});

// Parameters for characters
export const CharactersSchema = APISchema.extend({
  name: z.string().optional(),
  nameStartsWith: z.string().optional(),
  comics: IDListSchema.optional(),
  series: IDListSchema.optional(),
  events: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  orderBy: OrderBy("characters").optional(),
});

const FormatTypeSchema = z.enum(["comic", "collection"]);
export const DateDescriptorSchema = z.enum([
  "lastWeek",
  "thisWeek",
  "nextWeek",
  "thisMonth",
]);

// Parameters for comics
export const ComicsSchema = APISchema.extend({
  format: z.string().optional(),
  formatType: FormatTypeSchema.optional(),
  noVariants: z.boolean().optional(),
  dateDescriptor: DateDescriptorSchema.optional(),
  dateRange: DateRangeSchema.optional(),
  title: z.string().optional(),
  titleStartsWith: z.string().optional(),
  startYear: YearSchema.optional(),
  issueNumber: z.number().nonnegative().optional(),
  diamondCode: z.string().optional(),
  digitalId: z.number().optional(),
  upc: z.string().optional(),
  isbn: z.string().optional(),
  ean: z.string().optional(),
  issn: z.string().optional(),
  hasDigitalIssue: z.boolean().optional(),
  creators: IDListSchema.optional(),
  characters: IDListSchema.optional(),
  series: IDListSchema.optional(),
  events: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  sharedAppearances: IDListSchema.optional(),
  collaborators: IDListSchema.optional(),
  orderBy: OrderBy("comics").optional(),
});

// Parameters for creators
export const CreatorsSchema = APISchema.extend({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  suffix: z.string().optional(),
  nameStartsWith: z.string().optional(),
  firstNameStartsWith: z.string().optional(),
  middleNameStartsWith: z.string().optional(),
  lastNameStartsWith: z.string().optional(),
  comics: IDListSchema.optional(),
  series: IDListSchema.optional(),
  events: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  orderBy: OrderBy("creators").optional(),
});

// Parameters for events
export const EventsSchema = APISchema.extend({
  name: z.string().optional(),
  nameStartsWith: z.string().optional(),
  creators: IDListSchema.optional(),
  characters: IDListSchema.optional(),
  series: IDListSchema.optional(),
  comics: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  orderBy: OrderBy("events").optional(),
});

// Parameters for series
export const SeriesSchema = APISchema.extend({
  title: z.string().optional(),
  titleStartsWith: z.string().optional(),
  startYear: YearSchema.optional(),
  comics: IDListSchema.optional(),
  stories: IDListSchema.optional(),
  events: IDListSchema.optional(),
  creators: IDListSchema.optional(),
  characters: IDListSchema.optional(),
  seriesType: z
    .enum(["collection", "one shot", "limited", "ongoing"])
    .optional(),
  contains: FormatsSchema.optional(),
  orderBy: OrderBy("series").optional(),
});

// Parameters for stories
export const StoriesSchema = APISchema.extend({
  comics: IDListSchema.optional(),
  series: IDListSchema.optional(),
  events: IDListSchema.optional(),
  creators: IDListSchema.optional(),
  characters: IDListSchema.optional(),
  orderBy: OrderBy("stories").optional(),
});

// Union of all parameter schemas
export const ParameterSchema = z.union([
  CharactersSchema,
  ComicsSchema,
  CreatorsSchema,
  EventsSchema,
  SeriesSchema,
  StoriesSchema,
]);

// Validation schemas for each endpoint parameters
export const ValidateParams: EndpointMap<z.ZodType> & { all: z.ZodType } = {
  characters: CharactersSchema,
  comics: ComicsSchema,
  creators: CreatorsSchema,
  events: EventsSchema,
  series: SeriesSchema,
  stories: StoriesSchema,
  all: ParameterSchema,
};
