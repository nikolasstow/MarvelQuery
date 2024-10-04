import { z } from "zod";
import { ParameterSchema } from "./param-schemas";
import {
  ListSchema,
  MarvelCharacterSchema,
  MarvelComicSchema,
  MarvelCreatorSchema,
  MarvelEventSchema,
  MarvelSeriesSchema,
  MarvelStorySchema,
  RoleSummarySchema,
  SummarySchema,
  TypeSummarySchema,
} from "./data-schemas";
import { EndpointMap } from "../types/endpoint-types";

// Different data types for the Marvel API
export const EndpointTypeSchema = z.enum([
  "comics",
  "characters",
  "creators",
  "events",
  "series",
  "stories",
]);

// Schema for the endpoint
const EndpointSchema = z
  .array(z.any())
  .refine((val) => val.length >= 1 && val.length <= 3, {
    message: "Endpoint must have between 1 and 3 elements",
  })
  .refine(
    (val) => EndpointTypeSchema.safeParse(val[0]).success,
    (val) => ({
      message: `First element must be a valid endpoint type, got ${val[0]}`,
    })
  )
  .refine(
    (val) => val.length === 1 || typeof val[1] === "number",
    (val) => ({ message: `Second element must be a number, got ${val[1]}` })
  )
  .refine(
    (val) => val.length === 2 || EndpointTypeSchema.safeParse(val[2]).success,
    (val) => ({
      message: `Third element must be a valid endpoint type, got ${val[2]}`,
    })
  );

// Schema for the query function injected into each resource
const QueryResourceSchema = z
  .function()
  .args(EndpointTypeSchema, ParameterSchema);

// Schema for the query function injected into each collection
const QueryCollectionSchema = z.function().args(ParameterSchema);

// Schema for the properties injected into each resource
const ResourceProperties = z.object({
  id: z.number(),
  endpoint: EndpointSchema,
  query: QueryResourceSchema,
  fetch: z.function(),
  fetchSingle: z.function(),
});

// Schema for the properties injected into each collection
const CollectionProperties = z.object({
  endpoint: EndpointSchema,
  query: QueryCollectionSchema,
});

// Extended schemas for each resource summary
const ExtendedSummarySchema =
  SummarySchema.merge(ResourceProperties).nullable();
const ExtendedRoleSummarySchema =
  RoleSummarySchema.merge(ResourceProperties).nullable();
const ExtendedTypeSummarySchema =
  TypeSummarySchema.merge(ResourceProperties).nullable();

// Extended schemas for each collection type
const ExtendedComicListSchema = ListSchema.merge(CollectionProperties).extend({
  items: z.array(ExtendedSummarySchema),
});
const ExtendedStoryListSchema = ListSchema.merge(CollectionProperties).extend({
  items: z.array(ExtendedTypeSummarySchema),
});
const ExtendedSeriesListSchema = ListSchema.merge(CollectionProperties).extend({
  items: z.array(ExtendedSummarySchema),
});
const ExtendedEventListSchema = ListSchema.merge(CollectionProperties).extend({
  items: z.array(ExtendedSummarySchema),
});
const ExtendedCreatorListSchema = ListSchema.merge(CollectionProperties).extend(
  {
    items: z.array(ExtendedRoleSummarySchema),
  }
);
const ExtendedCharacterListSchema = ListSchema.merge(
  CollectionProperties
).extend({
  items: z.array(ExtendedRoleSummarySchema),
});

/** Extended schemas for each data type, replacing the default properties with the extended properties. */

const ExtendedComicSchema = MarvelComicSchema.merge(ResourceProperties).extend({
  series: ExtendedSummarySchema,
  variants: z.array(ExtendedSummarySchema),
  collections: z.array(ExtendedSummarySchema),
  collectedIssues: z.array(ExtendedSummarySchema),
  creators: ExtendedCreatorListSchema,
  characters: ExtendedCharacterListSchema,
  stories: ExtendedStoryListSchema,
  events: ExtendedEventListSchema,
});

const ExtendedEventsSchema = MarvelEventSchema.merge(ResourceProperties).extend(
  {
    comics: ExtendedComicListSchema,
    stories: ExtendedStoryListSchema,
    series: ExtendedSeriesListSchema,
    characters: ExtendedCharacterListSchema,
    creators: ExtendedCreatorListSchema,
    next: ExtendedSummarySchema,
    previous: ExtendedSummarySchema,
  }
);

const ExtendedSeriesSchema = MarvelSeriesSchema.merge(
  ResourceProperties
).extend({
  comics: ExtendedComicListSchema,
  stories: ExtendedStoryListSchema,
  events: ExtendedEventListSchema,
  characters: ExtendedCharacterListSchema,
  creators: ExtendedCreatorListSchema,
  next: ExtendedSummarySchema,
  previous: ExtendedSummarySchema,
});

const ExtendedCreatorSchema = MarvelCreatorSchema.merge(
  ResourceProperties
).extend({
  comics: ExtendedComicListSchema,
  stories: ExtendedStoryListSchema,
  events: ExtendedEventListSchema,
  series: ExtendedSeriesListSchema,
});

const ExtendedCharacterSchema = MarvelCharacterSchema.merge(
  ResourceProperties
).extend({
  comics: ExtendedComicListSchema,
  stories: ExtendedStoryListSchema,
  events: ExtendedEventListSchema,
  series: ExtendedSeriesListSchema,
});

const ExtendedStorySchema = MarvelStorySchema.merge(ResourceProperties).extend({
  comics: ExtendedComicListSchema,
  series: ExtendedSeriesListSchema,
  events: ExtendedEventListSchema,
  characters: ExtendedCharacterListSchema,
  creators: ExtendedCreatorListSchema,
  originalIssue: ExtendedSummarySchema,
});

// Map of endpoint types to their corresponding schemas
export const AutoQuerySchemaMap: EndpointMap<z.ZodType> = {
  comics: ExtendedComicSchema,
  events: ExtendedEventsSchema,
  series: ExtendedSeriesSchema,
  creators: ExtendedCreatorSchema,
  characters: ExtendedCharacterSchema,
  stories: ExtendedStorySchema,
};
