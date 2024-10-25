# MarvelQuery: Properties and Methods

The `MarvelQuery` class is the backbone of this library, designed to interact with the Marvel API. If you’re unfamiliar with the basics of initializing the library or creating your first query, please refer to the [Getting Started](getting-started.md) guide. Below, you’ll find more in-depth information about the properties and methods available for customizing queries and handling the data returned by the API.

## Initialization and Query Creation

The init() function is responsible for setting up the library with your API keys and any custom configurations you need to handle requests. Once initialized, it returns a query() function, which you’ll use to create queries for different Marvel API endpoints.

The [Configuration Options](configuration.md) page provides a detailed explanation of available configuration options, such as global parameters, custom fetch functions, and error handling.

| Function                                         | Arguments                                                | Returns                         | Description                                                  |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `init`                                           | [`keys: APIKeys`](#apikeys), [`config: Config`](#config) | [`query()`](#createquery)† | Initialize the library with public and private keys, and options such as global parameters and custom functions for requests, results, and http client. |
| `query<T extends Endpoint | EndpointType>`† | `endpoint: T, params: Params<AsEndpoint<T>>`             | `MarvelQuery<T>`                | A private function to create a new query instance. Must be accessed via init() initialization. |

† *The query function, which can be named anything, is returned by init(). It accepts two arguments: an API endpoint and the query parameters. For more information, see [Creating a Query](getting-started.md#creating-a-query).*

## Instance Properties and Methods

The MarvelQuery instance has additional properties after a response is received. Before making a request, it follows the structure of [`MarvelQueryInit`](#marvelqueryinit-pre-fetch), which contains information about the query setup. Once the query has been fetched, the instance becomes [`MarvelQueryFetched`](#marvelqueryfetched-post-fetch), extending the initial properties with additional data from the API response. If [`showHiddenProperties`](configuration.md#config-configuration-options) is enabled in the configuration, all properties will be visible from the beginning, even before a fetch occurs.

### `MarvelQueryInit` (Pre-fetch)

| Name            | Type                                           | Description                                                  |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `fetch()`       | `() => Promise<MarvelQuery>`                   | Executes the query and returns a `MarvelQueryFetched` instance with the results. The offset is adjusted to request the next page of results. |
| `request()`     | `(url: string) => Promise<APIWrapper<Result>>` | Sends the API request to the Marvel API and validates the response data. |
| `fetchSingle()` | `() => Promise<Result>`                        | Fetches a single result, overriding parameters to set the limit to 1 and offset to 0. |
| `buildURL()`    | `() => string`                                 | Constructs the full URL for the API request using keys, the endpoint, and query parameters. |
| `endpoint`      | [`EndpointDescriptor<E>`](endpoints.md#types)  | Contains the endpoint path (a tuple, e.g., ["comics", 1234]) and the data type (e.g., "comics"), defining the target location for the API request and the type of data being queried. |
| `params`        | [`Params<E>`](#params)                         | The query parameters used to refine the API request.         |
| `autoQuery`     | `boolean`                                      | Specifies whether AutoQuery can inject result data with additional properties and methods to enhance the experience of making follow-up queries. |
| `queryId`       | `string`                                       | A unique identifier for the query used for logging and tracking. |
| `validated`     | `{ parameters: boolean | undefined }`          | Indicates whether the query parameters have been validated. Contains only the parameters key. Values can be undefined, true (valid), or false (invalid). |
| `isComplete`    | `boolean`                                      | Indicates whether all possible results have been fetched. If true, there are no more pages of data to retrieve. |

### `MarvelQueryFetched` (Post-fetch)

After the query is executed and results are fetched, the instance contains additional properties as defined in MarvelQueryFetched, which extends the MarvelQueryInit properties.

| Name            | Type                                                      | Description                                                  |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `url`           | `string`                                                  | The complete URL used to make the API request, including all parameters and authentication. |
| `offset`        | `number`                                                  | The starting position for the current set of results, used for paginating through larger datasets. |
| `limit`         | `number`                                                  | The maximum number of results returned per request, as specified in the query parameters (max: 100). |
| `total`         | `number`                                                  | The total number of results available for the entire query across all pages. |
| `count`         | `number`                                                  | The number of results returned in the current request.       |
| `metadata`      | [`Metadata`](#metadata)                                   | Information about the API response, including status codes, attribution requirements, and other details. |
| `results`       | [`Result[]`](data-types.md#result-types)                  | The list of results returned for the current query request.  |
| `resultHistory` | [`Result[]`](data-types.md#result-types)                  | The cumulative list of results from all previous requests made for this query. |
| `validated`     | `{ parameters, results, autoQuery: boolean | undefined }` | Indicates whether validation was completed for specific tests. Parameters are the only validation test that runs pre-fetch. |

### Configuration for Hidden Properties

If [`showHiddenProperties`](configuration.md#config-configuration-options) is enabled in the configuration, the properties otherwise available only post-fetch ([`MarvelQueryFetched`](#marvelqueryfetched-post-fetch)) will be visible before fetching, giving you more transparency into all aspects of the query.

## Why no fetchAll() feature?

Due to the risks it could introduce, I decided not to include a `fetchAll()` function in this library. Automatically fetching all results at once could easily overwhelm the API, potentially leading to unintentional DDoS attacks, excessive rate-limiting, or overuse of resources. Instead, you can manually request all items from a query in a more controlled way:

```ts
const instance = query("comics", { 
  dateDescriptor: "thisWeek" 
});

while (!instance.isComplete) {
  await instance.fetch(); // Ensure each fetch is awaited.
}
```

It is **highly recommended** that a limit be included to the number of fetches to prevent overwhelming the API. Here’s an example with a limit:

```ts
let fetchCount = 0;
const maxFetches = 10;

while (!instance.isComplete && fetchCount < maxFetches) {
  await instance.fetch(); // Ensure it's awaited to avoid simultaneous requests.
  fetchCount++;
}
```

By managing the process manually and setting limits, you can avoid potential issues while still retrieving all necessary data in a controlled manner.

[← Back](getting-started.md) | [Table of Contents](table-of-contents.md) | [Next: **Structuring Queries with Endpoints →**](endpoints.md)
