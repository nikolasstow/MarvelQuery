import { z } from "zod";
import { Endpoint, EndpointType, IsEndpoint } from "./endpoint-types";
import {
  APISchema,
  CharactersSchema,
  ComicsSchema,
  CreatorsSchema,
  DateDescriptorSchema,
  EventsSchema,
  SeriesSchema,
  StoriesSchema,
} from "../schemas/param-schemas";
import { Formats, OrderByValues } from "../schemas/schema-utilities";

/** A map of parameters for each endpoint type. */
export type ParameterMap = {
  comics: ComicParams;
  characters: CharacterParams;
  creators: CreatorParams;
  events: EventParams;
  stories: StoryParams;
  series: SeriesParams;
};

/** A union of all parameter types. */
export type AnyParams =
  | APIBaseParams
  | ComicParams
  | CharacterParams
  | CreatorParams
  | EventParams
  | StoryParams
  | SeriesParams
  | undefined;

/** Parameters for a given endpoint. */
export type Params<E extends Endpoint> = 
  ParameterMap[E extends Required<Endpoint> // Does the Endpoint have a third element?
    ? E[2] // If it does, the third element is the data type
    : E extends [EndpointType, number] // Is there a second element and it's a number?
    ? never // Then it's a resource endpoint and has no parameters
    : E[0]]; // If neither of the above, the first element is the data type

/** Remove a property, and replace it with a stricter type. */
type Restrict<Z, P extends keyof Z, StrictProperty> = Omit<Z, P> &
  StrictProperty;

/** Create a union of strings from OrderByValues (a map keyed by EndpointType). */
type OrderByType<T extends EndpointType> = (typeof OrderByValues)[T][number];

/** A stricter type for ‘orderBy’ that uses OrderByType, a union of fields that can be used for ordering, and allows the sorting order to be flipped by adding a ‘-’ prefix to any of the fields */
type OrderByOptions<T extends EndpointType> =
  | OrderByType<T>
  | `-${OrderByType<T>}`;

/** Add an 'orderBy' property with a union of OrderByOptions (union of orderBy options for each endpoint) and an array of the same type. */
type OrderByProperty<T extends EndpointType> = {
  orderBy?: OrderByOptions<T> | OrderByOptions<T>[];
};

/** Restrict the 'orderBy' property with a stricter type */
type OrderBy<
  Z extends { orderBy?: string | string[] | undefined },
  T extends EndpointType
> = Restrict<Z, "orderBy", OrderByProperty<T>>;

/** Select one or multiple values from a list of valid values */
type SelectMultiple<F extends readonly string[]> = F[number] | F[number][];

/** Select one or multiple formats. */
type SelectMultipleFormats = SelectMultiple<typeof Formats>;
type Format = (typeof Formats)[number];

// Base parameters for all queries
/** ### Base Parameters
 * | Property         | Type                                                                                                 | Description
 * |------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------
 * | `modifiedSince`  | [`Date`](api-parameters.md#dates) | Only return resources created or changed since the specified date. (e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`          | `number`                                                                                             | Limit the result set to the specified number of resources.
 * | `offset`         | `number`                                                                                             | Skip the specified number of resources in the result set.
 */
export type APIBaseParams = z.input<typeof APISchema>;

// Character parameters
/**| Property         | Type                                                                                                    | Description
 * |------------------|---------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------
 * | `name`           | `string`                                                                                                | Return only characters matching the specified full character name (e.g. Spider-Man).
 * | `nameStartsWith` | `string`                                                                                                | Return only characters with names that begin with the specified string (e.g. Sp).
 * | `comics`         | [`IDList`](api-parameters.md#idlist) | Return only characters which appear in the specified comics.
 * | `series`         | [`IDList`](api-parameters.md#idlist) | Return only characters which appear in the specified series.
 * | `events`         | [`IDList`](api-parameters.md#idlist) | Return only characters which appear in the specified events.
 * | `stories`        | [`IDList`](api-parameters.md#idlist) | Return only characters which appear in the specified stories.
 * | `orderBy`        | `name` `modified`                                                                                       | Order the result set by a field or fields. Add a "-" to the value to sort in descending order. Multiple values are given priority in the order in which they are passed.
 * | `modifiedSince`  | [`Date`](api-parameters.md#dates)    | Only return characters created or changed since the specified date. (e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`          | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`         | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type CharacterParams = OrderBy<
  z.input<typeof CharactersSchema>,
  "characters"
>;

type StrictComic = Restrict<
  z.input<typeof ComicsSchema>,
  "format",
  { format?: Format }
>;
/**| Property            | Type                                                                                                    | Description
 * |---------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
 * | `format`            | `Format`                                                                                                | Filter by format (e.g. comic, digital comic, trade paperback).
 * | `formatType`        | `comic` or `collection`                                                                                 | Filter by the issue format type (comic or collection).
 * | `noVariants`        | `boolean`                                                                                               | Exclude variants (alternate covers, secondary printings, director's cuts, etc.) from the result set.
 * | `dateDescriptor`    | `lastWeek` `thisWeek` `nextWeek` `thisMonth`                                                            | Return comics within a predefined date range.
 * | `dateRange`         | `['YYYY-MM-DD', 'YYYY-MM-DD']`                                                                          | Return comics within a predefined date range. Dates must be specified as [date1, date2] (e.g. ['2013-01-01', '2013-01-02']).
 * | `title`             | `string`                                                                                                | Return only issues in series whose title matches the input.
 * | `titleStartsWith`   | `string`                                                                                                | Return only issues in series whose title starts with the input.
 * | `startYear`         | `number`                                                                                                | Return only issues in series whose start year matches the input.
 * | `issueNumber`       | `number`                                                                                                | Return only issues in series whose issue number matches the input.
 * | `diamondCode`       | `string`                                                                                                | Filter by diamond code.
 * | `digitalId`         | `number`                                                                                                | Filter by digital comic id.
 * | `upc`               | `string`                                                                                                | Filter by UPC.
 * | `isbn`              | `string`                                                                                                | Filter by ISBN.
 * | `ean`               | `string`                                                                                                | Filter by EAN.
 * | `issn`              | `string`                                                                                                | Filter by ISSN.
 * | `hasDigitalIssue`   | `boolean`                                                                                               | Filter by having digital rights.
 * | `creators`          | [`IDList`](api-parameters.md#idlist) | Return only issues containing the specified creators (accepts id or array of ids).
 * | `series`            | [`IDList`](api-parameters.md#idlist) | Return only issues in the specified series (accepts id or array of ids).
 * | `events`            | [`IDList`](api-parameters.md#idlist) | Return only issues in the specified events (accepts id or array of ids).
 * | `stories`           | [`IDList`](api-parameters.md#idlist) | Return only issues in the specified stories (accepts id or array of ids).
 * | `sharedAppearances` | [`IDList`](api-parameters.md#idlist) | Return only issues in which the specified characters appear together (e.g. issues in which both Spider-Man and Gamora appear).
 * | `collaborators`     | [`IDList`](api-parameters.md#idlist) | Return only issues in which the specified creators worked together (for example in which both Brian Bendis and Stan Lee did work).
 * | `orderBy`           | `focDate` `onsaleDate` `title` `issueNumber` `modified`                                                 | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince`     | [`Date`](api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`             | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`            | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type ComicParams = OrderBy<StrictComic, "comics">;

/**| Property               | Type                                                                                                    | Description
 * |------------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
 * | `firstName`            | `string`                                                                                                | Filter by creator first name (e.g. Brian).
 * | `middleName`           | `string`                                                                                                | Filter by creator middle name (e.g. Michael).
 * | `lastName`             | `string`                                                                                                | Filter by creator last name (e.g. Bendis).
 * | `suffix`               | `string`                                                                                                | Filter by suffix or honorific (e.g. Jr., Sr.).
 * | `nameStartsWith`       | `string`                                                                                                | Filter by creator names that match critera (e.g. B, St L).
 * | `firstNameStartsWith`  | `string`                                                                                                | Filter by creator first names that match critera (e.g. B, St L).
 * | `middleNameStartsWith` | `string`                                                                                                | Filter by creator middle names that match critera (e.g. Mi).
 * | `lastNameStartsWith`   | `string`                                                                                                | Filter by creator last names that match critera (e.g. Ben).
 * | `comics`               | [`IDList`](api-parameters.md#idlist) | Return only creators who worked on in the specified comics (accepts id or array of ids).
 * | `series`               | [`IDList`](api-parameters.md#idlist) | Return only creators who worked on the specified series (accepts id or array of ids).
 * | `events`               | [`IDList`](api-parameters.md#idlist) | Return only creators who worked on comics that took place in the specified events (accepts id or array of ids).
 * | `stories`              | [`IDList`](api-parameters.md#idlist) | Return only creators who worked on the specified stories (accepts id or array of ids).
 * | `orderBy`              | `lastName` `firstName` `middleName` `suffix` `modified`                                                 | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince`        | [`Date`](api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`                | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`               | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type CreatorParams = OrderBy<z.input<typeof CreatorsSchema>, "creators">;
/**| Property         | Type                                                                                                    | Description
 * |------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
 * | `name`           | `string`                                                                                                | Return only events which match the specified name.
 * | `nameStartsWith` | `string`                                                                                                | Return events with names that begin with the specified string (e.g. Sp).
 * | `creators`       | [`IDList`](api-parameters.md#idlist) | Return only events which feature work by the specified creators (accepts id or array of ids).
 * | `characters`     | [`IDList`](api-parameters.md#idlist) | Return only events which feature the specified characters (accepts id or array of ids).
 * | `series`         | [`IDList`](api-parameters.md#idlist) | Return only events which are part of the specified series (accepts id or array of ids).
 * | `comics`         | [`IDList`](api-parameters.md#idlist) | Return only events which take place in the specified comics (accepts id or array of ids).
 * | `stories`        | [`IDList`](api-parameters.md#idlist) | Return only events which take place in the specified stories (accepts id or array of ids).
 * | `orderBy`        | `name` `startDate` `modified`                                                                           | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince`  | [`Date`](api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`          | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`         | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type EventParams = OrderBy<z.input<typeof EventsSchema>, "events">;
/**| Property          | Type                                                                                                    | Description
 * |-------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
 * | `title`           | `string`                                                                                                | Return only series which match the specified title.
 * | `titleStartsWith` | `string`                                                                                                | Return series with titles that begin with the specified string (e.g. Sp).
 * | `startYear`       | `number`                                                                                                | Return only series matching the specified start year.
 * | `comics`          | [`IDList`](api-parameters.md#idlist) | Return only series which contain the specified comics (accepts id or array of ids).
 * | `stories`         | [`IDList`](api-parameters.md#idlist) | Return only series which contain the specified stories (accepts id or array of ids).
 * | `events`          | [`IDList`](api-parameters.md#idlist) | Return only series which have comics that take place during the specified events (accepts id or array of ids).
 * | `creators`        | [`IDList`](api-parameters.md#idlist) | Return only series which feature work by the specified creators (accepts id or array of ids).
 * | `characters`      | [`IDList`](api-parameters.md#idlist) | Return only series which feature the specified characters (accepts id or array of ids).
 * | `seriesType`      | `collection` `one shot` `limited` `ongoing`                                                             | Filter the series by publication frequency type.
 * | `orderBy`         | `title` `startyear` `modified`                                                                          | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince`   | [`Date`](api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`           | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`          | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type SeriesParams = OrderBy<z.input<typeof SeriesSchema>, "series">;

/**| Property        | Type                                                                                                    | Description
 * |-----------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
 * | `comics`        | [`IDList`](api-parameters.md#idlist) | Return only stories contained in the specified (accepts id or array of ids).
 * | `series`        | [`IDList`](api-parameters.md#idlist) | Return only stories contained the specified series (accepts id or array of ids).
 * | `events`        | [`IDList`](api-parameters.md#idlist) | Return only stories which take place during the specified events (accepts id or array of ids).
 * | `creators`      | [`IDList`](api-parameters.md#idlist) | Return only stories which feature work by the specified creators (accepts id or array of ids).
 * | `characters`    | [`IDList`](api-parameters.md#idlist) | Return only stories which feature the specified characters (accepts id or array of ids).
 * | `orderBy`       | `id` `modified`                                                                                         | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince` | [`Date`](api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`         | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`        | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type StoryParams = OrderBy<z.input<typeof StoriesSchema>, "stories">;
/** Return comics within a predefined date range.
 * `lastWeek` `thisWeek` `nextWeek` `thisMonth`
 */
export type DateDescriptor = z.input<typeof DateDescriptorSchema>;