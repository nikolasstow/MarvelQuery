# MarvelQuery: Properties and Methods

The `MarvelQuery` class is the backbone of this library, designed to interact with the Marvel API. If you’re unfamiliar with the basics of initializing the library or creating your first query, please refer to the [Getting Started](getting-started.md) guide. Below, you’ll find more in-depth information about the properties and methods available for customizing queries and handling the data returned by the API.

## Initialization and Query Creation{#init}

The init() function is responsible for setting up the library with your API keys and any custom configurations you need for handling requests. Once initialized, it returns a query() function, which you’ll use to create queries for different Marvel API endpoints.

For a detailed explanation of available configuration options, such as global parameters, custom fetch functions, and error handling, refer to the [Configuration Options](configuration.md) page.

| Function                                         | Arguments                                                | Returns                         | Description                                                  |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `init`                                           | [`keys: APIKeys`](#apikeys), [`config: Config`](#config) | [`query()`](#createquery)† | Initialize the library with public and private keys, and options such as global parameters and custom functions for requests, results, and http client. |
| `query<T extends Endpoint | EndpointType>`† | `endpoint: T, params: Params<AsEndpoint<T>>`             | `MarvelQuery<T>`                | Private function to create a new query instance. Must be accessed via init() initialization. |

† *The query function, which can be named anything, is returned by init(). It accepts two arguments: an API endpoint and the query parameters. For more information, see [Creating a Query](getting-started.md#query).*

## Instance Properties and Methods{#properties}

The MarvelQuery instance has different sets of properties depending on whether it has been fetched or not. Before making a request, it follows the structure of MarvelQueryInit, which contains information about the query setup. Once the query has been fetched, the instance becomes MarvelQueryFetched, extending the initial properties with additional data from the API response. If showHiddenProperties is enabled in the configuration, all properties will be visible from the beginning, even before a fetch occurs.

### `MarvelQueryInit` (Pre-fetch){#marvelqueryinit}

| Name            | Type                                           | Description                                                  |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `fetch()`       | `() => Promise<MarvelQuery>`                   | Executes the query and returns a `MarvelQueryFetched` instance with the results and the offset adjusted to request the next page of results. |
| `request()`     | `(url: string) => Promise<APIWrapper<Result>>` | Sends the API request to the Marvel API and validates the response data. |
| `fetchSingle()` | `() => Promise<Result>`                        | Fetches a single result, overriding parameters to set the limit to 1 and offset to 0. |
| `buildURL()`    | `() => string`                                 | Constructs the full URL for the API request using keys, the endpoint, and query parameters. |
| `endpoint`      | [`EndpointDescriptor<E>`](endpoints.md#types)  | Contains the endpoint path (a tuple, e.g., ["comics", 1234]) and the data type (e.g., "comics"), defining the target location for the API request and the type of data being queried. |
| `params`        | [`Params<E>`](#params)                         | The query parameters used to refine the API request.         |
| `autoQuery`     | `boolean`                                      | Specifies whether AutoQuery is enabled, allowing additional queries to be made on the result items. |
| `queryId`       | `string`                                       | A unique identifier for the query, used for logging and tracking. |
| `validated`     | `{ parameters: boolean | undefined }`          | Indicates whether the query parameters have been validated. Contains only the parameters key. Values can be undefined, true (valid), or false (invalid). |
| `isComplete`    | `boolean`                                      | Indicates whether all possible results have been fetched. If true, there are no more pages of data to retrieve. |

### `MarvelQueryFetched` (Post-fetch){#marvelqueryfetched}

After the query is executed and results are fetched, the instance contains additional properties as defined in MarvelQueryFetched, which extends the MarvelQueryInit properties.

| Name            | Type                                                      | Description                                                  |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `url`           | `string`                                                  | The complete URL used to make the API request, including all parameters and authentication. |
| `offset`        | `number`                                                  | The starting position for the current set of results, used for paginating through larger datasets. |
| `limit`         | `number`                                                  | The maximum number of results returned per request, as specified in the query parameters (max: 100). |
| `total`         | `number`                                                  | The total number of results available for the entire query across all pages. |
| `count`         | `number`                                                  | The number of results returned in the current request.       |
| `metadata`      | [`Metadata`](#metadata)                                   | Information about the API response, including status codes, attribution requirements, and other details. |
| `results`       | [`Result[]`](data-types.md#resulttypes)                   | The list of results returned for the current query request.  |
| `resultHistory` | [`Result[]`](data-types.md#resulttypes)                   | The cumulative list of results from all previous requests made for this query. |
| `validated`     | `{ parameters, results, autoQuery: boolean | undefined }` | Adds results and autoQuery keys, along with parameters, to track validation. Values can be undefined, true (valid), or false (invalid). |

### Configuration for Hidden Properties{#hidden}

If showHiddenProperties is enabled in the configuration, the properties that are typically available only post-fetch (MarvelQueryFetched) will be visible prior to fetching, giving you full visibility into all aspects of the query.

[Next: **Understanding AutoQuery →**](autoquery.md)
