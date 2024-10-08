# Data Types

## `Metadata`

The Metadata interface represents key information included in the API response from the Marvel API. It includes the HTTP status code, a textual status description, copyright notices, attribution information that must be displayed when using the API data, and a unique etag for caching purposes.

| Property          | Type            | Description                                                  |
| ----------------- | --------------- | ------------------------------------------------------------ |
| `code`            | `number`        | The HTTP status code of the returned result.                 |
| `status`          | `string`        | A string description of the call status.                     |
| `copyright`       | `string`        | The copyright notice for the returned result.                |
| `attributionText` | `string`        | The attribution notice for this result. Please display either this notice or the contents of the attributionHTML field on all screens which contain data from the Marvel Comics API. |
| `attributionHTML` | `string` `HTML` | An HTML representation of the attribution notice for this result. Please display either this notice or the contents of the attributionText field on all screens which contain data from the Marvel Comics API. |
| `etag`            | `string`        | A digest value of the content returned by the call.          |

**Common Status Codes:** 

- **200 OK**: The request was successful, and the server returned the requested data.
- **401 Unauthorized**: The request lacked valid authentication credentials (e.g., missing or invalid API key).
- **403 Forbidden**: The server understood the request but refuses to authorize it, possibly due to restrictions on the user’s account.
- **404 Not Found**: The requested resource could not be found on the server.
- **409 Conflict**: There was a conflict with the request, such as a query parameter issue or an invalid input.

These codes indicate the success or failure of the request and provide insights into why a request might not have succeeded.

## `APIResponse<R extends MarvelResult>`

| Property  | Type     | Description                                                  |
| --------- | -------- | ------------------------------------------------------------ |
| `offset`  | `number` | The requested offset (number of skipped results) of the call. |
| `limit`   | `number` | The requested result limit.                                  |
| `total`   | `number` | The total number of resources available given the current filter set. |
| `count`   | `number` | The total number of results returned by this call.           |
| `results` | `R[]`    | The results of the query.                                  |

# Result Types

The API returns structured data in an array, where each element corresponds to a specific type, such as characters, comics, creators, series, stories, and events. These data types provide detailed information about the returned resources, including metadata like IDs, names, descriptions, and related resources. Each result follows a consistent format, allowing for easy access and manipulation of the data within your application.

Properties and methods in **bold** are available only if [AutoQuery Injection is enabled in the configuration](configuration.md).

## `MarvelComic`

| Property             | Type                                              | Description                                                  |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **`endpoint`**       | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). |
| **`query()`**        | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the comic.                    |
| **`fetch()`**        | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`**  | [`MarvelComic`](#marvelcomic)                     | Fetches and returns the resource.                            |
| `id`                 | `number`                                          | The unique ID of the comic resource.                         |
| `resourceURI`        | `string`                                          | The canonical URL identifier for this resource.              |
| `modified`           | `string`                                          | The date the resource was most recently modified.            |
| `urls`               | [`URL[]`](#url)                                   | A set of public web site URLs for the resource.              |
| `thumbnail`          | [`Image`](#image)                                 | The representative image for this comic.                     |
| `digitalId`          | `number`                                          | The ID of the digital comic representation of this comic. Will be 0 if the comic is not available digitally. |
| `title`              | `string`                                          | The canonical title of the comic.                            |
| `issueNumber`        | `number`                                          | The number of the issue in the series (will generally be 0 for collection formats). |
| `variantDescription` | `string`                                          | If the issue is a variant (e.g. an alternate cover, second printing, or director’s cut), a text description of the variant. |
| `description`        | `string`                                          | The preferred description of the comic.                      |
| `isbn`               | `string`                                          | The ISBN for the comic (generally only populated for collection formats). |
| `upc`                | `string`                                          | The UPC barcode number for the comic (generally only populated for periodical formats). |
| `diamondCode`        | `string`                                          | The Diamond code for the comic.                              |
| `ean`                | `string`                                          | The EAN barcode for the comic.                               |
| `issn`               | `string`                                          | The ISSN barcode for the comic.                              |
| `format`             | [`Format`](#formats)                              | The format of the comic e.g. comic, digital comic, hardcover, trade paperback. |
| `pageCount`          | `number`                                          | The number of pages in the comic.                            |
| `textObjects`        | [`TextObject[]`](#textobject)                     | A set of descriptive text blurbs for the comic.              |
| `series`             | [`SeriesSummary`](#seriessummary)                 | A summary representation of the series to which this comic belongs. |
| `variants`           | [`ComicSummary[]`](#comicsummary)                 | A list of variant issues for this comic (includes the "original" issue if the current issue is a variant). |
| `collections`        | [`ComicSummary[]`](#comicsummary)                 | A list of collections which include this comic (will generally be empty if the comic's format is a collection). |
| `collectedIssues`    | [`ComicSummary[]`](#comicsummary)                 | A list of issues collected in this comic (will generally be empty for periodical formats such as "comic" or "magazine" |
| `dates`              | [`ComicDate[]`](#comicdate)                       | A list of key dates for this comic.                          |
| `prices`             | [`ComicPrice[]`](#comicprice)                     | A list of prices for this comic.                             |
| `images`             | [`Image[]`](#image`)                              | A list of promotional images associated with this comic.     |
| `creators`           | [`CreatorList[]`](#creatorlist)                   | A resource list containing the creators associated with this comic. |
| `characters`         | [`CharacterList[]`](#characterlist)               | A resource list containing the characters in this comic.     |
| `stories`            | [`StoryList[]`](#storylist)                       | A resource list containing the stories which appear in this comic. |
| `events`             | [`EventList[]`](#eventlist)                       | A resource list containing the events in which this comic appears. |

## `MarvelEvent`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["events", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the event.                    |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelEvent`](#marvelevent)                     | Fetches and returns the resource.                            |
| `id`                | `number`                                          | The unique ID of the event resource.                         |
| `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              |
| `modified`          | `string`                                          | The date the resource was most recently modified.            |
| `urls`              | [`URL[]`](#url)                                   | A set of public web site URLs for the resource.              |
| `thumbnail`         | [`Image`](#image)                                 | The representative image for this event.                     |
| `title`             | `string`                                          | The title of the event.                                      |
| `description`       | `string`                                          | A description of the event.                                  |
| `start`             | `YYYY-MM-DD HH:MM:SS`                             | The date of publication of the first issue in this event     |
| `end`               | `YYYY-MM-DD HH:MM:SS`                             | The date of publication of the last issue in this event      |
| `comics`            | [`ComicList[]`](#comiclist)                       | A resource list containing the comics in this event.         |
| `stories`           | [`StoryList[]`](#storylist)                       | A resource list containing the stories in this event.        |
| `series`            | [`SeriesList[]`](#serieslist)                     | A resource list containing the series in this event.         |
| `characters`        | [`CharacterList[]`](#characterlist)               | A resource list containing the characters which appear in this event. |
| `creators`          | [`CreatorList[]`](#creatorlist)                   | A resource list containing creators whose work appears in this event. |
| `next`              | [`EventSummary[]`](#eventsummary)                 | A summary representation of the event which follows this event in the timeline. |
| `previous`          | [`EventSummary[]`](#eventsummary)                 | A summary representation of the event which preceded this event in the timeline. |

## `MarvelSeries`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["series", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the series.                   |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelEvent`](#marvelevent)                     | Fetches and returns the resource.                            |
| `id`                | `number`                                          | The unique ID of the series resource.                        |
| `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              |
| `modified`          | `string`                                          | The date the resource was most recently modified.            |
| `urls`              | [`URL[]`](#url)                                   | A set of public web site URLs for the resource.              |
| `thumbnail`         | [`Image`](#image)                                 | The representative image for this series.                    |
| `title`             | `string`                                          | The canonical title of the series.                           |
| `description`       | `string`                                          | A description of the series.                                 |
| `startYear`         | `number`                                          | The first year in which the series has been published.       |
| `endYear`           | `number`                                          | The last year of publication for the series (conventionally, 2099 for ongoing series). |
| `rating`            | `string`                                          | The age-appropriateness rating for the series.               |
| `comics`            | [`ComicList[]`](#comiclist)                       | A resource list containing comics in this series.            |
| `stories`           | [`StoryList[]`](#storylist)                       | A resource list containing stories which occur in comics in this series. |
| `events`            | [`EventList[]`](#eventlist)                       | A resource list containing events which take place in comics in this series. |
| `characters`        | [`CharacterList[]`](#characterlist)               | A resource list containing the characters which appear in this series. |
| `creators`          | [`CreatorList[]`](#creatorlist)                   | A resource list containing creators whose work appears in this series. |
| `next`              | [`SeriesSummary[]`](#seriessummary)               | A summary representation of the series which follows this series in the timeline. |
| `previous`          | [`SeriesSummary[]`](#seriessummary)               | A summary representation of the series which preceded this series in the timeline. |

## `MarvelCreator`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["creators", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the creator.                  |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelCreator`](#marvelcreator)                 | Fetches and returns the resource.                            |
| `id`                | `number`                                          | The unique ID of the creator resource.                       |
| `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              |
| `modified`          | `string`                                          | The date the resource was most recently modified.            |
| `urls`              | [`URL[]`](#url)                                   | A set of public web site URLs for the resource.              |
| `thumbnail`         | [`Image`](#image)                                 | The representative image for this creator.                   |
| `firstName`         | `string`                                          | The first name of the creator.                               |
| `middleName`        | `string`                                          | The middle name of the creator.                              |
| `lastName`          | `string`                                          | The last name of the creator.                                |
| `suffix`            | `string`                                          | The suffix or honorific for the creator.                     |
| `fullName`          | `string`                                          | The full name of the creator (a space-separated concatenation of the above four fields). |
| `series`            | [`SeriesList[]`](#serieslist)                     | A resource list containing the series which feature work by this creator. |
| `stories`           | [`StoryList[]`](#storylist)                       | A resource list containing the stories which feature work by this creator. |
| `comics`            | [`ComicList[]`](#comiclist)                       | A resource list containing the comics which feature work by this creator. |
| `events`            | [`EventList[]`](#eventlist)                       | A resource list containing the events which feature work by this creator. |

## `MarvelCharacter`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["characters", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the character.                |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelCharacter`](#marvelcharacter)             | Fetches and returns the resource.                            |
| `id`                | `number`                                          | The unique ID of the character resource.                     |
| `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              |
| `modified`          | `string`                                          | The date the resource was most recently modified.            |
| `urls`              | [`URL[]`](#url)                                   | A set of public web site URLs for the resource.              |
| `thumbnail`         | [`Image`](#image)                                 | The representative image for this character.                 |
| `name`              | `string`                                          | The name of the character.                                   |
| `description`       | `string`                                          | A short bio or description of the character.                 |
| `comics`            | [`ComicList[]`](#comiclist)                       | A resource list containing comics which feature this character. |
| `stories`           | [`StoryList[]`](#storylist)                       | A resource list containing the stories in which this character appears. |
| `events`            | [`EventList[]`](#eventlist)                       | A resource list containing the events in which this character appears. |
| `series`            | [`SeriesList[]`](#serieslist)                     | A resource list containing the series in which this character appears. |

## `MarvelStory`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["stories", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the story.                    |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelStory`](#marvelstory)                     | Fetches and returns the resource.                            |
| `id`                | `number`                                          | The unique ID of the story resource.                         |
| `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              |
| `modified`          | `string`                                          | The date the resource was most recently modified.            |
| `urls`              | [`URL[]`](#url)                                   | A set of public web site URLs for the resource.              |
| `thumbnail`         | [`Image`](#image)                                 | The representative image for this story.                     |
| `title`             | `string`                                          | The story title.                                             |
| `description`       | `string`                                          | A description of the story.                                  |
| `type`              | `string`                                          | The story type e.g. interior story, cover, text story.       |
| `comics`            | [`ComicList[]`](#comiclist)                       | A resource list containing comics in which this story takes place. |
| `series`            | [`SeriesList[]`](#serieslist)                     | A resource list containing series in which this story appears. |
| `events`            | [`EventList[]`](#eventlist)                       | A resource list containing events in which this story appears. |
| `characters`        | [`CharacterList[]`](#characterlist)               | A resource list containing the characters which appear in this story. |
| `creators`          | [`CreatorList[]`](#creatorlist)                   | A resource list of creators who worked on this story.        |
| `originalIssue`     | [`ComicSummary[]`](#comicsummary)                 | A summary representation of the issue in which this story was originally published. |

### `TextObject`

| Property   | Type     | Description                                                  |
| ---------- | -------- | ------------------------------------------------------------ |
| `type`     | `string` | Only return resources created or changed since the specified date. |
| `language` | `string` | The IETF language tag denoting the language the text object is written in. |
| `text`     | `string` | The text.                                                    |

### `URL`

| Property | Type     | Description                                      |
| -------- | -------- | ------------------------------------------------ |
| `type`   | `string` | A text identifier for the URL.                   |
| `url`    | `string` | A full URL (including scheme, domain, and path). |

### `Image`

| Property    | Type     | Description                                      |
| ----------- | -------- | ------------------------------------------------ |
| `path`      | `string` | The directory path of the image.                 |
| `extension` | `string` | A full URL (including scheme, domain, and path). |

### `ComicDate`

| Property | Type     | Description                                             |
| -------- | -------- | ------------------------------------------------------- |
| `type`   | `string` | A description of the date (e.g. onsale date, FOC date). |
| `date`   | `string` | The date.                                               |

### `Comic Price`

| Property | Type     | Description                                                  |
| -------- | -------- | ------------------------------------------------------------ |
| `type`   | `string` | A description of the price (e.g. print price, digital price). |
| `price`  | `number` | The price (all prices in USD).                               |

### Formats

The `Format` type categorizes different forms of comic publications, ranging from traditional print editions like comics, magazines, and graphic novels, to modern digital formats such as digital comics and infinite comics. Available formats include:

- `comic`
- magazine
- `trade paperback`
- `hardcover`
- `digest`
- `graphic novel`
- `digital comic`
- `infinite comic`

### `Summary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual resource.                         |
| `name`              | `string`                                          | The canonical name of the resource.                          |
| **`id`**            | `number`                                          | The unique ID of the resource.                               |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the item.                     |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelResult`](#marvelresult)                   | Fetches and returns the resource.                            |

### `RoleSummary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual resource.                         |
| `name`              | `string`                                          | The canonical name of the resource.                          |
| `role`              | `string`                                          | The role of the person in the parent entity.                 |
| **`id`**            | `number`                                          | The unique ID of the resource.                               |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["characters", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the item.                     |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelResult`](#marvelresult)                   | Fetches and returns the resource.                            |

### `TypeSummary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual resource.                         |
| `name`              | `string`                                          | The canonical name of the resource.                          |
| `type`              | `string`                                          | The type of the entity.                                      |
| **`id`**            | `number`                                          | The unique ID of the resource.                               |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["stories", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the item.                     |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelResult`](#marvelresult)                   | Fetches and returns the resource.                            |

### `ComicSummary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual comic resource.                   |
| `name`              | `string`                                          | The canonical name of the comic.                             |
| **`id`**            | `number`                                          | The unique ID of the comic resource.                         |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the comic.                    |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the comic resource in the results array. |
| **`fetchSingle()`** | [`MarvelComic`](#marvelcomic)                     | Fetches and returns the resource.                            |

### `StorySummary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual resource.                         |
| `name`              | `string`                                          | The canonical name of the story.                             |
| `type`              | `string`                                          | The type of the story (interior or cover).                   |
| **`id`**            | `number`                                          | The unique ID of the story resource.                         |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["stories", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the story.                    |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelComic`](#marvelcomic)                     | Fetches and returns the resource.                            |

### `SeriesSummary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual series resource.                  |
| `name`              | `string`                                          | The canonical name of the series.                            |
| **`id`**            | `number`                                          | The unique ID of the series resource.                        |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["series", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the series.                   |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelComic`](#marvelcomic)                     | Fetches and returns the resource.                            |

### `CreatorSummary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual resource.                         |
| `name`              | `string`                                          | The full name of the creator.                                |
| `role`              | `string`                                          | The role of the creator in the parent entity.                |
| **`id`**            | `number`                                          | The unique ID of the creator resource.                       |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["creator", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the creator.                  |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelComic`](#marvelcomic)                     | Fetches and returns the resource.                            |

### `CharacterSummary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual resource.                         |
| `name`              | `string`                                          | The full name of the character.                              |
| `role`              | `string`                                          | The role of the character in the parent entity.              |
| **`id`**            | `number`                                          | The unique ID of the character resource.                     |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["characters", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the character.                |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelComic`](#marvelcomic)                     | Fetches and returns the resource.                            |

### `EventSummary`

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                          | The path to the individual event resource.                   |
| `name`              | `string`                                          | The name of the event.                                       |
| **`id`**            | `number`                                          | The unique ID of the event resource.                         |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["events", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the event.                    |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelComic`](#marvelcomic)                     | Fetches and returns the resource.                            |

### `List`

| Property        | Type                                              | Description                                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `available`     | `number`                                          | The number of total available resources in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                          | The number of resources returned in this collection (up to 20). |
| `collectionURI` | `string`                                          | The path to the full list of items in this collection.       |
| `items`         | [`Summary`](#summary)                             | The list of returned items in this collection.               |
| **`endpoint`**  | [`Endpoint`](utility-types.md#endpoints)          | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["events", 123, "comics"]`). |
| **`query()`**   | [`QueryResource`](marvel-query.md#query-resource) | Query the collection, filtering the resources by the parameters. |

### `ComicList`

| Property        | Type                                              | Description                                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `available`     | `number`                                          | The number of total available issues in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                          | The number of issues returned in this collection (up to 20). |
| `collectionURI` | `string`                                          | The path to the full list of issues in this collection.      |
| `items`         | [`ComicSummary`](#comicsummary)                   | The list of returned issues in this collection.              |
| **`endpoint`**  | [`Endpoint`](utility-types.md#endpoints)          | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["events", 123, "comics"]`). |
| **`query()`**   | [`QueryResource`](marvel-query.md#query-resource) | Query the comic collection, filtering the resources by the parameters. |

### `StoryList`

| Property        | Type                                              | Description                                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `available`     | `number`                                          | The number of total available stories in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                          | The number of stories returned in this collection (up to 20). |
| `collectionURI` | `string`                                          | The path to the full list of stories in this collection.     |
| `items`         | [`StorySummary`](#storysummary)                   | The list of returned stories in this collection.             |
| **`endpoint`**  | [`Endpoint`](utility-types.md#endpoints)          | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["comics", 123, "stories"]`). |
| **`query()`**   | [`QueryResource`](marvel-query.md#query-resource) | Query the story collection, filtering the resources by the parameters. |

### `SeriesList`

| Property        | Type                                              | Description                                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `available`     | `number`                                          | The number of total available series in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                          | The number of series returned in this collection (up to 20). |
| `collectionURI` | `string`                                          | The path to the full list of series in this collection.      |
| `items`         | [`SeriesSummary`](#seriessummary)                 | The list of returned series in this collection.              |
| **`endpoint`**  | [`Endpoint`](utility-types.md#endpoints)          | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["comics", 123, "series"]`). |
| **`query()`**   | [`QueryResource`](marvel-query.md#query-resource) | Query the comic collection, filtering the resources by the parameters. |

### `EventList`

| Property        | Type                                              | Description                                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `available`     | `number`                                          | The number of total available events in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                          | The number of events returned in this collection (up to 20). |
| `collectionURI` | `string`                                          | The path to the full list of events in this collection.      |
| `items`         | [`EventSummary`](#eventsummary)                   | The list of returned events in this collection.              |
| **`endpoint`**  | [`Endpoint`](utility-types.md#endpoints)          | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["comics", 123, "events"]`). |
| **`query()`**   | [`QueryResource`](marvel-query.md#query-resource) | Query the event collection, filtering the resources by the parameters. |

### `CreatorList`

| Property        | Type                                              | Description                                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `available`     | `number`                                          | The number of total available creators in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                          | The number of creators returned in this collection (up to 20). |
| `collectionURI` | `string`                                          | The path to the full list of creators in this collection.    |
| `items`         | [`CreatorSummary`](#creatorsummary)               | The list of returned creators in this collection.            |
| **`endpoint`**  | [`Endpoint`](utility-types.md#endpoints)          | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["comics", 123, "creators"]`). |
| **`query()`**   | [`QueryResource`](marvel-query.md#query-resource) | Query the creator collection, filtering the resources by the parameters. |

### `CharacterList`

| Property        | Type                                              | Description                                                  |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `available`     | `number`                                          | The number of total available characters in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                          | The number of characters returned in this collection (up to 20). |
| `collectionURI` | `string`                                          | The path to the full list of characters in this collection.  |
| `items`         | [`CharacterSummary`](#charactersummary)           | The list of returned characters in this collection.          |
| **`endpoint`**  | [`Endpoint`](utility-types.md#endpoints)          | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["comics", 123, "characters"]`). |
| **`query()`**   | [`QueryResource`](marvel-query.md#query-resource) | Query the character collection, filtering the resources by the parameters. |

### `MarvelResult`

The core properties found in all data-types returned by the Marvel API

| Property            | Type                                              | Description                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `id`                | `number`                                          | The unique ID of the resource.                               |
| `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              |
| `modified`          | `string`                                          | The date the resource was most recently modified.            |
| `urls`              | [`URL[]`](#url)                                   | A set of public web site URLs for the resource.              |
| `thumbnail`         | [`Image`](#image)                                 | The representative image for this item.                      |
| **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["stories", 123]`). |
| **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the result.                   |
| **`fetch()`**       | [`MarvelQuery`](marvel-query.md)                  | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelStory`](#marvelstory)                     | Fetches and returns the resource.                            |

## Utility Types

### `ResultMap`

```ts
/**
 * A map of result types by endpoint.
 */
type ResultMap = {
  comics: MarvelComic;
  characters: MarvelCharacter;
  creators: MarvelCreator;
  events: MarvelEvent;
  stories: MarvelStory;
  series: MarvelSeries;
};
```

### `ResultType`

```ts
/**
 * ResultType is a utility type designed to determine the expected data type returned 
 * from a given API endpoint.
 */
type APIResult<E extends Endpoint> = ResultMap[DataType<E>];
```

### `DataType`

```ts
/**
 * Utility type that determines the type of data being queried.
 * It works by checking the endpoint and looking for the last data type in the endpoint.
 * If the last element is a type, use it. If it's a number, use the type in the first element.
 */
type DataType<E> = E extends Endpoint
  ? E[2] extends EndpointType // If there is a 3rd element (and is an EndpointType) use it
    ? E[2]
    : E[0] extends EndpointType // Otherwise use the first element (if it is an EndpointType)
    ? E[0]
    : ["Error, could not determine data type", E]
  : ["Error, not a valid endpoint", E];
```