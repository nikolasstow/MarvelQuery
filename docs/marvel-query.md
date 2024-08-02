# `MarvelQuery`

### Static Properties

These are properties set during Don't have API Keys? Visit https://developer.marvel.com/ to create an account for free.

| Property        | Type                            | Description                                                  |
| --------------- | ------------------------------- | ------------------------------------------------------------ |
| `globalParams`  | [`GlobalParams`](#globalparams) | Global parameters to be applied to all queries, or all queries of a specific type. |
| `omitUndefined` | `boolean`                       | Remove undefined parameters from the query. Set as true by default. |
| *`onRequest`*   | `(url: string) => void`         | An optional function that will be called before the request is sent. You can use it to log the request or track the number of requests to the API. |
| *`onResult`*    | [`OnResultMap`](#onresultmap)   | Add custom functions to be called when a request of a specific type is complete. |

| Function | Arguments                                                | Returns                         | Description                                                  |
| -------- | -------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `init`   | [`keys: APIKeys`](#apikeys), [`config: Config`](#config) | [`createQuery()`](#createquery) | Initialize the library with public and private keys, and options such as global parameters and custom functions for requests, results, and http client. |

### Instance Properties `<E extends Endpoint>`

| Property        | Type                                  | Description                                                |
| --------------- | ------------------------------------- | ---------------------------------------------------------- |
| `endpoint`      | [`Endpoint`](#endpoint)               | The endpoint as passed in createQuery().                   |
| `params`        | [`ParamsType<E>`]                     | Parameters of the query.                                   |
| `type`          | [`EndpointType`](#endpointtypes)      | The data type of the results returned by the query .       |
| `url`           | `string`                              | The URL generated for the API request.                     |
| `count`         | `number`                              | The number of results returned by the query.               |
| `total`         | `total`                               | The total number of results available for the query.       |
| `metadata`      | [`Metadata`](#metadata)               | Metadata included in the API response.                     |
| `responseData`  | [`APIResponseData`](#apiresponsedata) | Data for the API response.                                 |
| `result`        | [`ResultType<Type>`](#resulttype)     | The first result of the query.                             |
| `results`       | [`ResultType<Type>[]`](#resulttype)   | The results of the query.                                  |
| `resultHistory` | [`ResultType<Type>[]`](#resulttype)   | The conjunction of all results from this query instance.   |
| `isComplete`    | `boolean`                             | All of the available results have been returned when true. |

| Function                                | Arguments                                  | Returns                                                | Description                                                  |
| --------------------------------------- | ------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------ |
| `createQuery` `<Type extends Endpoint>` | `endpoint: Type, params: ParamsType<Type>` | `MarvelQuery<Type>`                                    | Private function to create a new query instance. Must be accessed via init() initialization. |
| `fetch`                                 | `void`                                     | [`Promise<MarvelQuery<Type>>`](#marvelquery)           | Validates parameters with zod, builds URL, makes the request, and returns a [`MarvelQuery`](#marvelquery) object with the results from the API. |
| `fetchSingle`                           | `void`                                     | [`Promise<MarvelQuery<Type>>`](#marvelquery)           | Sets offset to 0 and limit to 1 to fetch a single result.    |
| `buildURL`                              | `void`                                     | `string`                                               | Builds the URL of the query with the parameters, timestamp and hash. |
| `request`                               | `url: string`                              | [`Promise<APIWrapper<ResultType<Type>>>`](#apiwrapper) | Sends the request to the API, and validate the response.     |
