# AutoQuery: Building Blocks

AutoQuery is a powerful feature that automatically injects methods and properties into API responses wherever a URI is found. These additions allow you to seamlessly create follow-up queries directly from the result data without manually constructing new queries. By detecting URIs associated with related resources or collections (such as comics, characters, or creators), AutoQuery makes it easy to navigate through connected data. For example, once you retrieve a character, you can use the injected query methods to fetch related comics or other associated resources with minimal effort.

Let's look at the structure of an [Event](data-types.md#event) resource as it's returned by the API:

| Property      | Type                                    | Description                                                  |
| ------------- | --------------------------------------- | ------------------------------------------------------------ |
| `id`          | `number`                                | The unique ID of the event resource.                         |
| `resourceURI` | `string`                                | The canonical URL identifier for this resource.              |
| `modified`    | `string`                                | The date the resource was most recently modified.            |
| `urls`        | [`URL[]`](data-types.md#url)            | A set of public web site URLs for the resource.              |
| `thumbnail`   | [`Image`](data-types.md#image)          | The representative image for this event.                     |
| `title`       | `string`                                | The title of the event.                                      |
| `description` | `string`                                | A description of the event.                                  |
| `start`       | `YYYY-MM-DD HH:MM:SS`                   | The date of publication of the first issue in this event     |
| `end`         | `YYYY-MM-DD HH:MM:SS`                   | The date of publication of the last issue in this event      |
| `comics`      | [`List`](data-types#comiclist)          | A resource list containing the comics in this event.         |
| `stories`     | [`List`](data-types#storylist)          | A resource list containing the stories in this event.        |
| `series`      | [`List`](data-types.md#serieslist)      | A resource list containing the series in this event.         |
| `characters`  | [`List`](data-types.md#characterlist)   | A resource list containing the characters which appear in this event. |
| `creators`    | [`List`](data-types.md#creatorlist)     | A resource list containing creators whose work appears in this event. |
| `next`        | [`Summary`](data-types.md#eventsummary) | A summary representation of the event which follows this event in the timeline. |
| `previous`    | [`Summary`](data-types.md#eventsummary) | A summary representation of the event which preceded this event in the timeline. |

Two non-primitive types should stand out: Summaries and Lists. A **Summary** is a lightweight representation of an API resource, containing only essential information, such as the resource’s name and a reference link. Similarly, a **List** represents an API Collection; it includes a reference link and an `items` array of Summaries representing the first 20 resources in the collection. The names of these list properties should look familiar as they are data types and align with the six root-level data types defined in the [`EndpointType`](endpoints.md#endpointtype) union. Each result type (e.g., [Comics](data-types.md#comic), [Series](data-types.md#series)) contains lists for the other five resource types, excluding itself. For instance, an Event result won’t contain an `events` property but will include the others as shown above.

A few notable exceptions: a **Creator** result does not have a characters property, and while a **Comic** result contains a series property, it is a **Summary** rather than a **List** because a comic belongs to only one series.

## `List` Properties

Each **List** represents a collection of related resources. It includes properties such as available and returned to track the total and currently returned items, a collectionURI pointing to the entire collection, and an items array containing **Summaries** of the returned resources.

| Property        | Type                                                         | Description                                                  |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `available`     | `number`                                                     | The number of total available resources in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                                     | The number of resources returned in this collection (up to 20). |
| `collectionURI` | `string`                                                     | The path to the full list of items in this collection.       |
| `items`         | [`Summary`](data-types.md#summary)                           | The list of returned items in this collection.               |
| **`endpoint`**  | [`Endpoint`](endpoints.md#endpoint)                          | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["events", 123, "comics"]`). |
| **`query()`**   | [`QueryResource`](autoquery-blocks.md#resources-with-autoquery) | Query the collection, filtering the resources by the parameters. |

**Injected Properties and Methods**

Using the `collectionURI`, the AutoQuery feature injects two key additions into Lists:

- `endpoint`: The endpoint as a tuple.
- `query()`: A method that allows you to query the collection directly, using parameters to refine the search.

## `Summary` Properties

A **Summary** represents a single resource and provides key information about that resource in a compact form. Summaries are typically found as an array within the items property of a **List**, but they can also appear in other places throughout the API. For example, in a **Comic**, Summary arrays are used in properties like `variants`, `collections`, and `collectedIssues`. Additionally, summaries are used as the type for properties such as `next` and `previous` in an **Event** or **Series**, as well as `originalIssue` in a **Story**. Some summaries, like those for **Characters** and **Creators**, include additional properties such as `role`, while **Story** summaries include a `type` property to specify the type of story.

| Property            | Type                                                         | Description                                                  |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                                     | The path to the individual resource.                         |
| `name`              | `string`                                                     | The canonical name of the resource.                          |
| **`id`**            | `number`                                                     | The unique ID of the resource.                               |
| **`endpoint`**      | [`Endpoint`](endpoints.md#endpoint)                          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). |
| **`query()`**       | [`QueryResource`](autoquery-blocks.md#resources-with-autoquery) | Query a collection relating to the item.                     |
| **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)                    | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelResult`](data-types.md#marvelresult)                 | Fetches and returns the resource.                            |

**Injected Properties and Methods**

Using the resourceURI, the AutoQuery feature injects several key additions into Summaries:

- `id`: The unique ID extracted from the resource’s URI for easy reference.
- `endpoint`: The endpoint as a tuple.
- `query()`: A method that allows you to query a collection related to the resource directly from the summary.
- `fetch()`: Fetches the resource and returns a MarvelQuery instance, placing the result inside the results array.
- `fetchSingle()`:  Fetches and returns the resource as a single item.

## Result Properties

At the root level, the result represents a resource, meaning we can treat it just like a **Summary**. As a result, AutoQuery injects the same properties and methods directly into the resource, giving you powerful tools for seamless follow-up queries. Below is an example of an **Event** result, showing both the original and injected properties:

| Property            | Type                                                         | Description                                                  |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`endpoint`**      | [`Endpoint`](endpoints.md#endpoint)                          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["events", 123]`). |
| **`query()`**       | [`QueryResource`](autoquery-blocks.md#resources-with-autoquery) | Query a collection relating to the event.                    |
| **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)                    | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`Promise<Event>`](data-types.md#marvelevent)                | Fetches and returns the resource.                            |
| `id`                | `number`                                                     | The unique ID of the event resource.                         |
| `resourceURI`       | `string`                                                     | The canonical URL identifier for this resource.              |
| `modified`          | `string`                                                     | The date the resource was most recently modified.            |
| `urls`              | [`URL[]`](data-types.md#url)                                 | A set of public web site URLs for the resource.              |
| `thumbnail`         | [`Image`](data-types.md#image)                               | The representative image for this event.                     |
| `title`             | `string`                                                     | The title of the event.                                      |
| `description`       | `string`                                                     | A description of the event.                                  |
| `start`             | `YYYY-MM-DD HH:MM:SS`                                        | The date of publication of the first issue in this event     |
| `end`               | `YYYY-MM-DD HH:MM:SS`                                        | The date of publication of the last issue in this event      |
| `comics`            | [`ComicList`](data-types.md#comiclist)                       | A resource list containing the comics in this event.         |
| `stories`           | [`StoryList`](data-types.md#storylist)                       | A resource list containing the stories in this event.        |
| `series`            | [`SeriesList`](data-types.md#serieslist)                     | A resource list containing the series in this event.         |
| `characters`        | [`CharacterList`](data-types.md#characterlist)               | A resource list containing the characters which appear in this event. |
| `creators`          | [`CreatorList`](data-types.md#creatorlist)                   | A resource list containing creators whose work appears in this event. |
| `next`              | [`EventSummary`](data-types.md#eventsummary)                 | A summary representation of the event which follows this event in the timeline. |
| `previous`          | [`EventSummary`](data-types.md#eventsummary)                 | A summary representation of the event which preceded this event in the timeline. |

For a detailed breakdown of all the data types returned by the Marvel API, please reference [API Response](data-types.md)

## An important Note on Lists, Collections, Summaries, Results, and Resources:

It’s important to distinguish between Lists, Collections, Summaries, and Resources, as these terms represent different levels of data abstraction.

- **Resources** are items within the Marvel API (e.g., a single comic or character).
- **Summaries** are compact representations of resources, providing key properties such as `name` and `resourceURI`. They are often found inside `Lists`, but they can also appear in other properties that represent individual resources (e.g., the `next` or `previous` properties of an [`Event`](data-types.md#event)).
- **Result items** are full representations of resources, containing all of the properties of the resource and `Lists` of the collections of related resources. The `fetchSingle()` method resolves to a result item, and the `results` property in a `MarvelQuery` instance contains an array of result items.
- **Collections** represent groups of related resources of a single type (e.g., a collection of comics or stories), and they all share a relation to a specific Resource of a different kind (e.g., comics related to a particular character). For more details on how collection endpoints work, see [Endpoints](endpoints.md#collection-endpoints).
- **Lists** are a representation of a Collection. While the Collection refers to a complete set of Resources, a List summarizes the Collection and includes information such as the total number of available items and an array of Summaries representing the first 20 Resources in the Collection.

Regarding the methods added to result data, it’s helpful to consider what the data represents. Both a result item and a Summary represent individual **Resources**, so they share the same injected methods for fetching and querying resources.

[← Back](examples.md) | [Table of Contents](table-of-contents.md) | [Next: **The Magical Methods of AutoQuery** →](autoquery-methods.md)
