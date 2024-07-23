import { z } from "zod";
import { EndpointType } from "./utility-types";
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

/** Remove a property, and replace it with a stricter type. */
type Restrict<
  ZodSchema,
  Property extends keyof ZodSchema,
  StrictProperty
> = Omit<ZodSchema, Property> & StrictProperty;

/** Create a stricter type for the 'orderBy' property. */
type OrderByType<Type extends EndpointType> =
  (typeof OrderByValues)[Type][number]; // Creates a union of strings from OrderByValues[Type].
type PrefixWithDash<Type extends string> = `-${Type}`; // Prefixes a string with '-'
type AddDescending<Type extends string> = Type | PrefixWithDash<Type>; // Creates a union of the original string with the prefixed string.
type OrderByOptions<Type extends EndpointType> = AddDescending<
  OrderByType<Type>
>; // creates a union of the strings from OrderByValues[Type] with the prefixed strings.

/** Add an 'orderBy' property with a union of OrderByOptions (union of orderBy options for each endpoint) and an array of the same type. */
type OrderByProperty<Type extends EndpointType> = {
  orderBy?: OrderByOptions<Type> | OrderByOptions<Type>[];
};

/** Restrict the 'orderBy' property with a stricter type */
type OrderBy<
  Schema extends { orderBy?: string | string[] | undefined },
  Type extends EndpointType
> = Restrict<Schema, "orderBy", OrderByProperty<Type>>;

/** Select one or multiple values from a list of valid values */
type SelectMultiple<Options extends readonly string[]> =
  | Options[number]
  | Options[number][];

/** Select one or multiple formats. */
type Formats = SelectMultiple<typeof Formats>;

// Base parameters for all queries
/** ### Base Parameters
 * | Property         | Type                                                                                                 | Description
 * |------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------
 * | `modifiedSince`  | [`Date`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#dates) | Only return resources created or changed since the specified date. (e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`          | `number`                                                                                             | Limit the result set to the specified number of resources.
 * | `offset`         | `number`                                                                                             | Skip the specified number of resources in the result set.
 */
export type APIBase = z.input<typeof APISchema>;

// Character parameters
/**| Property         | Type                                                                                                    | Description
 * |------------------|---------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------
 * | `name`           | `string`                                                                                                | Return only characters matching the specified full character name (e.g. Spider-Man).
 * | `nameStartsWith` | `string`                                                                                                | Return only characters with names that begin with the specified string (e.g. Sp).
 * | `comics`         | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only characters which appear in the specified comics.
 * | `series`         | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only characters which appear in the specified series.
 * | `events`         | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only characters which appear in the specified events.
 * | `stories`        | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only characters which appear in the specified stories.
 * | `orderBy`        | `name` `modified`                                                                                       | Order the result set by a field or fields. Add a "-" to the value to sort in descending order. Multiple values are given priority in the order in which they are passed.
 * | `modifiedSince`  | [`Date`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#dates)    | Only return characters created or changed since the specified date. (e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`          | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`         | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type Characters = OrderBy<
  z.input<typeof CharactersSchema>,
  "characters"
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
 * | `creators`          | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only issues containing the specified creators (accepts id or array of ids).
 * | `series`            | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only issues in the specified series (accepts id or array of ids).
 * | `events`            | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only issues in the specified events (accepts id or array of ids).
 * | `stories`           | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only issues in the specified stories (accepts id or array of ids).
 * | `sharedAppearances` | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only issues in which the specified characters appear together (e.g. issues in which both Spider-Man and Gamora appear).
 * | `collaborators`     | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only issues in which the specified creators worked together (for example in which both Brian Bendis and Stan Lee did work).
 * | `orderBy`           | `focDate` `onsaleDate` `title` `issueNumber` `modified`                                                 | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince`     | [`Date`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`             | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`            | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type Comics = OrderBy<z.input<typeof ComicsSchema>, "comics">;

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
 * | `comics`               | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only creators who worked on in the specified comics (accepts id or array of ids).
 * | `series`               | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only creators who worked on the specified series (accepts id or array of ids).
 * | `events`               | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only creators who worked on comics that took place in the specified events (accepts id or array of ids).
 * | `stories`              | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only creators who worked on the specified stories (accepts id or array of ids).
 * | `orderBy`              | `lastName` `firstName` `middleName` `suffix` `modified`                                                 | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince`        | [`Date`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`                | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`               | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type Creators = OrderBy<z.input<typeof CreatorsSchema>, "creators">;
/**| Property         | Type                                                                                                    | Description
 * |------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
 * | `name`           | `string`                                                                                                | Return only events which match the specified name.
 * | `nameStartsWith` | `string`                                                                                                | Return events with names that begin with the specified string (e.g. Sp).
 * | `creators`       | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only events which feature work by the specified creators (accepts id or array of ids).
 * | `characters`     | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only events which feature the specified characters (accepts id or array of ids).
 * | `series`         | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only events which are part of the specified series (accepts id or array of ids).
 * | `comics`         | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only events which take place in the specified comics (accepts id or array of ids).
 * | `stories`        | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only events which take place in the specified stories (accepts id or array of ids).
 * | `orderBy`        | `name` `startDate` `modified`                                                                           | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince`  | [`Date`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`          | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`         | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type Events = OrderBy<z.input<typeof EventsSchema>, "events">;
/**| Property          | Type                                                                                                    | Description
 * |-------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
 * | `title`           | `string`                                                                                                | Return only series which match the specified title.
 * | `titleStartsWith` | `string`                                                                                                | Return series with titles that begin with the specified string (e.g. Sp).
 * | `startYear`       | `number`                                                                                                | Return only series matching the specified start year.
 * | `comics`          | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only series which contain the specified comics (accepts id or array of ids).
 * | `stories`         | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only series which contain the specified stories (accepts id or array of ids).
 * | `events`          | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only series which have comics that take place during the specified events (accepts id or array of ids).
 * | `creators`        | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only series which feature work by the specified creators (accepts id or array of ids).
 * | `characters`      | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only series which feature the specified characters (accepts id or array of ids).
 * | `seriesType`      | `collection` `one shot` `limited` `ongoing`                                                             | Filter the series by publication frequency type.
 * | `orderBy`         | `title` `startyear` `modified`                                                                          | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince`   | [`Date`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`           | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`          | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type Series = z.input<typeof SeriesSchema>;
/**| Property        | Type                                                                                                    | Description
 * |-----------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
 * | `comics`        | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only stories contained in the specified (accepts id or array of ids).
 * | `series`        | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only stories contained the specified series (accepts id or array of ids).
 * | `events`        | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only stories which take place during the specified events (accepts id or array of ids).
 * | `creators`      | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only stories which feature work by the specified creators (accepts id or array of ids).
 * | `characters`    | [`IDList`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#idlist) | Return only stories which feature the specified characters (accepts id or array of ids).
 * | `orderBy`       | `id` `modified`                                                                                         | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
 * | `modifiedSince` | [`Date`](https://github.com/nikolasstow/MarvelQuery/blob/init-and-docs/docs/api-parameters.md#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
 * | `limit`         | `number`                                                                                                | Limit the result set to the specified number of resources.
 * | `offset`        | `number`                                                                                                | Skip the specified number of resources in the result set.
 */
export type Stories = z.input<typeof StoriesSchema>;
/** Return comics within a predefined date range.
 * `lastWeek` `thisWeek` `nextWeek` `thisMonth`
 */
export type DateDescriptor = z.input<typeof DateDescriptorSchema>;
