## `MarvelQuery<E extends Endpoint>`

### Static Functions

| Function                                         | Arguments                                                | Returns                         | Description                                                  |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `init`                                           | [`keys: APIKeys`](#apikeys), [`config: Config`](#config) | [`createQuery()`](#createquery) | Initialize the library with public and private keys, and options such as global parameters and custom functions for requests, results, and http client. |
| `createQuery<T extends Endpoint | EndpointType>` | `endpoint: T, params: Params<AsEndpoint<T>>`             | `MarvelQuery<T>`                | Private function to create a new query instance. Must be accessed via init() initialization. |

### Instance Properties

| Property        | Type                                  | Description                                                |
| --------------- | ------------------------------------- | ---------------------------------------------------------- |
| `endpoint`      | [`Endpoint`](#endpoint)               | The endpoint as passed in createQuery().                   |
| `params`        | [`ParamsType<E>`]()                   | Parameters of the query, determined by the Endpoint (E)    |
| `type`          | [`EndpointType`](#endpointtypes)      | The data type of the results returned by the query .       |
| `url`           | `string`                              | The URL generated for the API request.                     |
| `count`         | `number`                              | The number of results returned by the query.               |
| `total`         | `total`                               | The total number of results available for the query.       |
| `metadata`      | [`Metadata`](#metadata)               | Metadata included in the API response.                     |
| `responseData`  | [`APIResponseData`](#apiresponsedata) | Data for the API response.                                 |
| `results`       | [`ResultType<E>[]`](#resulttype)      | The results of the query.                                  |
| `resultHistory` | [`ResultType<E>[]`](#resulttype)      | The conjunction of all results from this query instance.   |
| `isComplete`    | `boolean`                             | All of the available results have been returned when true. |

| Function      | Arguments                                                    | Returns                                         | Description                                                  |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| `fetch`       | `void`                                                       | [`Promise<MarvelQuery<E>>`](#marvelquery)       | Validates parameters with zod, builds URL, makes the request, and returns a [`MarvelQuery`](#marvelquery) object with the results from the API. |
| `fetchSingle` | `void`                                                       | [`Promise<ExtendResult<E>>`](#marvelquery)      | Sets offset to 0 and limit to 1 to fetch a single result.    |
| `buildURL`    | `apiKeys: APIKeys, endpoint: Endpoint, params: Record<string, unknown>` | `string`                                        | Builds the URL of the query with the parameters, timestamp and hash. |
| `request`     | `url: string`                                                | [`Promise<APIWrapper<Result<E>>>`](#apiwrapper) | Sends the request to the API, and validate the response.     |
