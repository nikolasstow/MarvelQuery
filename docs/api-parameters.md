# API Parameters

[← Back](autoquery-examples.md) | [Table of Contents](table-of-contents.md) | [Next: **Explore the Core Data Types of Every Marvel API Response →**](data-types.md)

## Base Parameters
| Property         | Type                  | Description                                                                                         
|------------------|-----------------------|-------------------------------------------------------------------------------------
| `modifiedSince`  | [`Date`](#dates)      | Only return resources created or changed since the specified date.
| `limit`          | `number`              | Limit the result set to the specified number of resources.
| `offset`         | `number`              | Skip the specified number of resources in the result set.

## `CharacterParams`

| Property         | Type                | Description                                                                                         
|------------------|---------------------|-----------------------------------------------------------------------------------------------------
| `name`           | `string`            | Return only characters matching the specified full character name (e.g. Spider-Man).
| `nameStartsWith` | `string`            | Return only characters with names that begin with the specified string (e.g. Sp).
| `comics`         | [`IDList`](#idlist) | Return only characters which appear in the specified comics (accepts a comma-separated list of ids).
| `series`         | [`IDList`](#idlist) | Return only characters which appear in the specified series (accepts a comma-separated list of ids).
| `events`         | [`IDList`](#idlist) | Return only characters which appear in the specified events (accepts a comma-separated list of ids).
| `stories`        | [`IDList`](#idlist) | Return only characters which appear in the specified stories (accepts a comma-separated list of ids).
| `orderBy`        | `name` `modified`   | Order the result set by a field or fields. Add a "-" to the value to sort in descending order. Multiple values are given priority in the order in which they are passed.
| `modifiedSince`  | [`Date`](#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
| `limit`          | `number`            | Limit the result set to the specified number of resources.
| `offset`         | `number`            | Skip the specified number of resources in the result set.

## `ComicParams`
| Property            | Type                                                    | Description                                                  |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| `format`            | [`Format`](#formats)                                    | Filter by format (e.g. comic, digital comic, trade paperback). |
| `formatType`        | `comic` or `collection`                                 | Filter by the issue format type (comic or collection).       |
| `noVariants`        | `boolean`                                               | Exclude variants (alternate covers, secondary printings, director's cuts, etc.) from the result set. |
| `dateDescriptor`    | `lastWeek` `thisWeek` `nextWeek` `thisMonth`            | Return comics within a predefined date range.                |
| `dateRange`         | `['YYYY-MM-DD', 'YYYY-MM-DD']`                          | Return comics within a predefined date range. Dates must be specified as [date1, date2] (e.g. ['2013-01-01', '2013-01-02']). |
| `title`             | `string`                                                | Return only issues in series whose title matches the input.  |
| `titleStartsWith`   | `string`                                                | Return only issues in series whose title starts with the input. |
| `startYear`         | `number`                                                | Return only issues in series whose start year matches the input. |
| `issueNumber`       | `number`                                                | Return only issues in series whose issue number matches the input. |
| `diamondCode`       | `string`                                                | Filter by diamond code.                                      |
| `digitalId`         | `number`                                                | Filter by digital comic id.                                  |
| `upc`               | `string`                                                | Filter by UPC.                                               |
| `isbn`              | `string`                                                | Filter by ISBN.                                              |
| `ean`               | `string`                                                | Filter by EAN.                                               |
| `issn`              | `string`                                                | Filter by ISSN.                                              |
| `hasDigitalIssue`   | `boolean`                                               | Filter by having digital rights.                             |
| `creators`          | [`IDList`](#idlist)                                     | Return only issues containing the specified creators (accepts id or array of ids). |
| `characters`        | [`IDList`](#idlist)                                     | Return only comics which feature the specified characters (accepts id or array of ids). |
| `series`            | [`IDList`](#idlist)                                     | Return only issues in the specified series (accepts id or array of ids). |
| `events`            | [`IDList`](#idlist)                                     | Return only issues in the specified events (accepts id or array of ids). |
| `stories`           | [`IDList`](#idlist)                                     | Return only issues in the specified stories (accepts id or array of ids). |
| `sharedAppearances` | [`IDList`](#idlist)                                     | Return only issues in which the specified characters appear together (e.g. issues in which both Spider-Man and Gamora appear). |
| `collaborators`     | [`IDList`](#idlist)                                     | Return only issues in which the specified creators worked together (for example in which both Brian Bendis and Stan Lee did work). |
| `orderBy`           | `focDate` `onsaleDate` `title` `issueNumber` `modified` | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed. |
| `modifiedSince`     | [`Date`](#dates)                                        | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object). |
| `limit`             | `number`                                                | Limit the result set to the specified number of resources.   |
| `offset`            | `number`                                                | Skip the specified number of resources in the result set.    |

## `CreatorParams`

| Property               | Type                                                    | Description                                                                                         
|------------------------|---------------------------------------------------------|-----------------------------------------------------------------------------------------------------
| `firstName`            | `string`                                                | Filter by creator first name (e.g. Brian).
| `middleName`           | `string`                                                | Filter by creator middle name (e.g. Michael).
| `lastName`             | `string`                                                | Filter by creator last name (e.g. Bendis).
| `suffix`               | `string`                                                | Filter by suffix or honorific (e.g. Jr., Sr.).
| `nameStartsWith`       | `string`                                                | Filter by creator names that match critera (e.g. B, St L).
| `firstNameStartsWith`  | `string`                                                | Filter by creator first names that match critera (e.g. B, St L).
| `middleNameStartsWith` | `string`                                                | Filter by creator middle names that match critera (e.g. Mi).
| `lastNameStartsWith`   | `string`                                                | Filter by creator last names that match critera (e.g. Ben).
| `comics`               | [`IDList`](#idlist)                                     | Return only creators who worked on in the specified comics (accepts id or array of ids).
| `series`               | [`IDList`](#idlist)                                     | Return only creators who worked on the specified series (accepts id or array of ids).
| `events`               | [`IDList`](#idlist)                                     | Return only creators who worked on comics that took place in the specified events (accepts id or array of ids).
| `stories`              | [`IDList`](#idlist)                                     | Return only creators who worked on the specified stories (accepts id or array of ids).
| `orderBy`              | `lastName` `firstName` `middleName` `suffix` `modified` | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
| `modifiedSince`        | [`Date`](#dates)                                        | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
| `limit`                | `number`                                                | Limit the result set to the specified number of resources.
| `offset`               | `number`                                                | Skip the specified number of resources in the result set.

## `EventParams`

| Property         | Type                          | Description                                                                                         
|------------------|-------------------------------|-----------------------------------------------------------------------------------------------------
| `name`           | `string`                      | Return only events which match the specified name.
| `nameStartsWith` | `string`                      | Return events with names that begin with the specified string (e.g. Sp).
| `creators`       | [`IDList`](#idlist)           | Return only events which feature work by the specified creators (accepts id or array of ids).
| `characters`     | [`IDList`](#idlist)           | Return only events which feature the specified characters (accepts id or array of ids).
| `series`         | [`IDList`](#idlist)           | Return only events which are part of the specified series (accepts id or array of ids).
| `comics`         | [`IDList`](#idlist)           | Return only events which take place in the specified comics (accepts id or array of ids).
| `stories`        | [`IDList`](#idlist)           | Return only events which take place in the specified stories (accepts id or array of ids).
| `orderBy`        | `name` `startDate` `modified` | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
| `modifiedSince`  | [`Date`](#dates)              | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
| `limit`          | `number`                      | Limit the result set to the specified number of resources.
| `offset`         | `number`                      | Skip the specified number of resources in the result set.

## `SeriesParams`

| Property          | Type                                        | Description                                                                                         
|-------------------|---------------------------------------------|-----------------------------------------------------------------------------------------------------
| `title`           | `string`                                    | Return only series which match the specified title.
| `titleStartsWith` | `string`                                    | Return series with titles that begin with the specified string (e.g. Sp).
| `startYear`       | `number`                                    | Return only series matching the specified start year.
| `comics`          | [`IDList`](#idlist)                         | Return only series which contain the specified comics (accepts id or array of ids).
| `stories`         | [`IDList`](#idlist)                         | Return only series which contain the specified stories (accepts id or array of ids).
| `events`          | [`IDList`](#idlist)                         | Return only series which have comics that take place during the specified events (accepts id or array of ids).
| `creators`        | [`IDList`](#idlist)                         | Return only series which feature work by the specified creators (accepts id or array of ids).
| `characters`      | [`IDList`](#idlist)                         | Return only series which feature the specified characters (accepts id or array of ids).
| `seriesType`      | `collection` `one shot` `limited` `ongoing` | Filter the series by publication frequency type.
| `orderBy`         | `title` `startyear` `modified`              | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
| `modifiedSince`   | [`Date`](#dates)                            | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
| `limit`           | `number`                                    | Limit the result set to the specified number of resources.
| `offset`          | `number`                                    | Skip the specified number of resources in the result set.

## `StoryParams`

| Property        | Type                | Description                                                                                         
|-----------------|---------------------|-----------------------------------------------------------------------------------------------------
| `comics`        | [`IDList`](#idlist) | Return only stories contained in the specified (accepts id or array of ids).
| `series`        | [`IDList`](#idlist) | Return only stories contained the specified series (accepts id or array of ids).
| `events`        | [`IDList`](#idlist) | Return only stories which take place during the specified events (accepts id or array of ids).
| `creators`      | [`IDList`](#idlist) | Return only stories which feature work by the specified creators (accepts id or array of ids).
| `characters`    | [`IDList`](#idlist) | Return only stories which feature the specified characters (accepts id or array of ids).
| `orderBy`       | `id` `modified`     | Order the result set by a property or properties. Add a "-" to the value sort in descending order. Multiple values as an array are given priority in the order in which they are passed.
| `modifiedSince` | [`Date`](#dates)    | Only return resources created or changed since the specified date. (Accepts various date formats; e.g. 'YYYY-MM-DD', JavaScript Date object).
| `limit`         | `number`            | Limit the result set to the specified number of resources.
| `offset`        | `number`            | Skip the specified number of resources in the result set.

## Common Types

### Formats

The `Format` type categorizes various forms of comic publications, ranging from traditional print editions like `comics`, `magazines`, and `graphic novels`, to modern digital formats such as `digital comics` and `infinite comics`. Available formats include:
- `comic`
- `magazine`
- `trade paperback`
- `hardcover`
- `digest`
- `graphic novel`
- `digital comic`
- `infinite comic`

### `IDList`

The `IDList` type represents a list of Marvel API item IDs. It can be a single number or an array of numbers, which will be transformed into a comma-separated string for API compatibility. Generally, the IDs should match the type suggested by the property’s name. For example, if a property of this type is named `comics`, the values should be comic IDs. This does not apply to all uses of this type, so if unsure, please reference the documentation for the specific property.

- **Single ID:** A number representing a single item ID.
- **Multiple IDs:** An array of numbers representing various item IDs.

### Dates

The `Date` type accepts various date formats and transforms them into an ISO 8601 date string before being sent to the API. This transformation ensures that the date string is both accurate and universally recognizable.

#### Accepted Input Formats

The following date formats are accepted:

- **JavaScript Date Object**: Directly handles instances of the `Date` object, converting them to ISO 8601 format.
- **YYYY-MM-DD**: A simple date string with year, month, and day.
- **YYYY-MM-DDTHH:MM:SS**: Includes date and time in hours, minutes, and seconds.
- **YYYY-MM-DDTHH:MM:SS±HH:MM**: A complete date and time string including a timezone offset (e.g., `-05:00` for EST).


### `Params`

```ts
/**
 * ParamsType is a utility type that determines the expected parameters for a given API
 * endpoint. It uses conditional types to map an endpoint to its corresponding
 * parameters, providing type safety and clarity when constructing API requests.
 */
type Params<E extends Endpoint> = 
  ParameterMap[E extends Required<Endpoint> // Does the Endpoint have a third element?
    ? E[2] // If it does, the third element is the data type
    : E extends [EndpointType, number] // Is there a second element and is it a number?
    ? never // Then it's a resource endpoint and has no parameters
    : E[0]]; // If neither of the above, the first element is the data type
```
### `ParameterMap`

```ts
/**
 * A map of parameter types by endpoint.
 */
type ParameterMap = {
  comics: ComicParams;
  characters: CharacterParams;
  creators: CreatorParams;
  events: EventParams;
  stories: StoryParams;
  series: SeriesParams;
};
```

[← Back](autoquery-examples.md) | [Table of Contents](table-of-contents.md) | [Next: **Explore the Core Data Types of Every Marvel API Response →**](data-types.md)
