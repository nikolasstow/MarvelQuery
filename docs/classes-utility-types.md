# Classes and Utility Types

## Initialization: MarvelQuery.init()

The `init` function initializes the MarvelQuery library with your API keys and configuration settings. It returns the `createQuery` function, ensuring that no queries can be created without proper initialization. 

```ts
const createQuery = MarvelQuery.init({
    publicKey: "your-public-key",
    privateKey: "your-private-key",
  }, {
    // Configuration options...
  });
```

## APIKeys

| Property     | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `publicKey`  | `string` | Marvel API public key as set during initialization.  |
| `privateKey` | `string` | Marvel API private key as set during initialization. |

## Configuration Options

| Property        | Type                                | Description                                                  |
| --------------- | ----------------------------------- | ------------------------------------------------------------ |
| `globalParams`  | `GlobalParams`                      | Global parameters to be applied to all queries, or all queries of a specific type. |
| `omitUndefined` | `boolean`                           | Remove undefined parameters from queries.                    |
| `onResult`      | `OnResultMap`                       | A map of functions to be called when all results, or results of a specific type are returned. |
| `onRequest`     | ` (url: string) => void`            | A function that is called for each request. Useful for monitoring your API usage. |
| `fetchFunction` | `(url: string) => Promise<unknown>` | Replace the default fetch function (axios) with your own http client. |

## Creating a Query: createQuery()

The createQuery function, returned by init, creates a new instance of MarvelQuery for executing API queries. It validates the endpoint and parameters, leveraging the initialization settings to ensure valid requests.

```ts
const character = await createQuery(["characters"], {
  nameStartsWith: "Stilt-Man",
}).fetch();
```

## MarvelQuery

Don't have API Keys? Visit https://developer.marvel.com/ to create an account for free.

| Property        | Type                            | Description                                                  |
| --------------- | ------------------------------- | ------------------------------------------------------------ |
| `publicKey`     | `string`                        | Marvel API public key as set during initialization.          |
| `privateKey`    | `string`                        | Marvel API private key as set during initialization.         |
| `globalParams`  | [`GlobalParams`](#globalparams) | Global parameters to be applied to all queries, or all queries of a specific type. |
| `omitUndefined` | `boolean`                       | Remove undefined parameters from the query. Set as true by default. |
| *`onRequest`*   | `(url: string) => void`         | An optional function that will be called before the request is sent. You can use it to log the request or track the number of requests to the API. |
| *`onResult`*    | [`OnResultMap`](#onresultmap)   | Add custom functions to be called when a request of a specific type is complete. |

| Function                                | Arguments                                                | Returns                                                  | Description                                                  |
| --------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `init`                                  | [`keys: APIKeys`](#apikeys), [`config: Config`](#config) | [`createQuery()`](#createquery)                          | Initialize the library with public and private keys, and options such as global parameters and custom functions for requests, results, and http client. |
| `createQuery` `<Type extends Endpoint>` | `endpoint: Type, params: ParamsType<Type>`               | `MarvelQuery<Type>`                                      | Private function to create a new query instance. Must be accessed via init() initialization. |
| `fetch`                                 | `void`                                                   | [`Promise<MarvelQueryResult<Type>>`](#marvelqueryresult) | Validates parameters with zod, builds URL, makes the request, and returns a [`MarvelQueryResult`](#marvelqueryresult) object with the results from the API. |
| `fetchSingle`                           | `void`                                                   | [`Promise<MarvelQueryResult<Type>>`](#marvelqueryresult) | Sets offset to 0 and limit to 1 to fetch a single result.    |
| `buildURL`                              | `void`                                                   | `string`                                                 | Builds the URL of the query with the parameters, timestamp and hash. |
| `request`                               | `url: string`                                            | [`Promise<APIWrapper<ResultType<Type>>>`](#apiwrapper)   | Sends the request to the API, and validate the response.     |

## MarvelQueryResult

MarvelQueryResult extends the [`MarvelQuery`](#marvelquery) class and inherits all of it's properties and functions. It adds additional properties and functions specific to the handling of API results.

##### Additional Properties

| Property        | Type                                  | Description                                              |
| --------------- | ------------------------------------- | -------------------------------------------------------- |
| `url`           | `string`                              | The URL generated for the API request.                   |
| `metadata`      | [`Metadata`](#metadata)               | Metadata included in the API response.                   |
| `responseData`  | [`APIResponseData`](#apiresponsedata) | Data for the API response.                               |
| `result`        | [`ResultType<Type>`](#resulttype)     | The first result of the query.                           |
| `results`       | [`ResultType<Type>[]`](#resulttype)   | The results of the query.                                |
| `resultHistory` | [`ResultType<Type>[]`](#resulttype)   | The conjunction of all results from this query instance. |

##### Additional Functions

| Function | Arguments | Returns                                                  | Description                                                  |
| -------- | --------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `fetch`  | `void`    | [`Promise<MarvelQueryResult<Type>>`](#marvelqueryresult) | Provides the same function as in the [`MarvelQuery`](#marvelquery) class but increments the offset to return the next page of results. |

#### Summary of Inherited Properties and Functions

For detailed descriptions of the inherited properties and methods, please refer to the [MarvelQuery](#marvelquery) class documentation.

**Inherited Properties:**

​	•	publicKey

​	•	privateKey

​	•	globalParams

​	•	omitUndefined

​	•	static onRequest

​	•	static onResult

**Inherited Functions:**

​	•	init

​	•	fetch (Note: Overridden to support pagination)

​	•	fetchSingle

​	•	buildURL

​	•	request

## Endpoints

In the MarvelQuery library, the endpoint is split into an array by slashes. These three parts determine what you are looking for, and what data you will receive. 

1. The first element is the type of the subject of your query. It is the only required element, and with it alone you can search the entirety of the Marvel API for items of that type. 
2. The second element is an id, querying a specific item of the data type in the previous element. (e.g. `1009466`)
3. The third element specifiies the data type expected in the results (e.g. "creators" that worked on a comic series, or "events" that feature a specific character,)

```ts
// So let's break down how you'd actually use the endpoint in your query.
// When making a broad search, your endpoint will only consist of a single element: the data-type. 

// Like fetching the latest comics...
const endpoint = ['comics'];
const params = {
  dateDescriptor: "thisWeek"
}

const comics = await createQuery(endpoint, params)
	.fetch()
	.then(api => api.results) // returns MarvelComic[]

// Or finding your favorite character.
const endpoint = ['characters'];
const params = {
  nameStartsWith: "Stilt-Man"
}

const stiltMan = await createQuery(endpoint, params)
	.fetchSingle()
	.then(api => api.result.id); // returns 1009627

// If you have an id, you can request that character individually by adding it to the array
const endpoint = ['characters', 1009627];

// Even better, with an id you can fetch all the comics featuring that character...
const endpoint = ['characters', 1009627, 'comics'];
// Or all of the events the character appears in.
const endpoint = ['characters', 1009627, 'events'];

const eventsWithStilts = await createQuery(endpoint, params)
	.fetch()
	.then(api => api.results) // returns MarvelEvent[]
```



### GlobalParams

The globalParams feature in your library allows you to set default parameters for API queries to streamline requests and ensure consistency across different endpoints. By defining these parameters globally, you can avoid redundancy and ensure that certain criteria are always applied unless explicitly overridden.

| Property     | Type                                  | Description                                                  |
| ------------ | ------------------------------------- | ------------------------------------------------------------ |
| `all`        | [`APIBaseParams`](#apibaseparams)     | Parameters which apply to all requests, and as such are limited to parameters found on all endpoints (`modifiedSince`, `limit`, and `offset`). |
| `comics`     | [`ComicParams`](#comicparams)         | Set default parameters for all api requests for comics.      |
| `characters` | [`CharacterParams`](#characterparams) | Set default parameters for all api requests for characters . |
| `creators`   | [`CreatorParams`](#creatorparams)     | Set default parameters for all api requests for creators.    |
| `events`     | [`EventParams`](#eventparams)         | Set default parameters for all api requests for events.      |
| `stories`    | [`StoryParams`](#storyparams)         | Set default parameters for all api requests for stories.     |
| `series`     | [`SeriesParams`](#seriesparams)       | Set default parameters for all api requests for series.      |

### OnResultMap

| Property     | Type                                                     | Description                                                  |
| ------------ | -------------------------------------------------------- | ------------------------------------------------------------ |
| `any`        | [`AnyResultFunction`](#anyresultfunction)                | A function that will be called when a query of any type is finished, unless overridden with onResult function for a specific type. |
| `comics`     | [`OnResultFunction<MarvelComic>`](#onresultfunction)     | Upon the return of comic results from the API, this function will run and pass an array of marvel comics. |
| `characters` | [`OnResultFunction<MarvelCharacter>`](#onresultfunction) | Upon the return of character results from the API, this function will run and pass an array of marvel characters. |
| `creators`   | [`OnResultFunction<MarvelCreator>`](#onresultfunction)   | Upon the return of creator results from the API, this function will run and pass an array of marvel creators. |
| `events`     | [`OnResultFunction<MarvelEvent>`](#onresultfunction)     | Upon the return of event results from the API, this function will run and pass an array of marvel events. |
| `stories`    | [`OnResultFunction<MarvelStory>`](#onresultfunction)     | Upon the return of story results from the API, this function will run and pass an array of marvel stories. |
| `series`     | [`OnResultFunction<MarvelSeries>`](#onresultfunction)    | Upon the return of series results from the API, this function will run and pass an array of marvel series. |

### AnyResultFunction

```ts
// A function that will be called when a query of any type is finished, unless overridden with onResult function for a specific type.
type AnyResultFunction = OnResultFunction<AnyType>;
```

### AnyType

```ts
// A union type of all datatypes
type AnyType = MarvelComic | MarvelCharacter | MarvelCreator | MarvelEvent | MarvelSeries | MarvelStory;
```

### DataType

```ts
/** Utitility type that determines which type of data being queried.
 * It works by checking the endpoint and looking for the last data type in the endpoint.
 * If the last element is a type, use it. If it's a number, use the type in the first element.
 */
type DataType<ArrayType extends readonly unknown[]> = ArrayType extends [
  ...infer _,
  infer LastElement
]
  ? LastElement extends number
    ? ArrayType extends [infer FirstElement, ...unknown[]]
      ? FirstElement
      : never
    : LastElement
  : never;
```

### EndpointType, EndpointResultType, DistinctEndpointType, and Endpoint

```ts
// Data types of the Marvel API are the core of the endpoint
type EndpointType = "comics" | "characters" | "creators" | "events" | "series" | "stories";
// Utility type to remove one of the types from the union
type EndpointResultType<Type extends EndpointType> = Exclude<EndpointType, Type>;
// Utility type that infers the type of the first element of the endpoint, so it can be passed to the EndpointResultType.
// This removes the type of the first element from the available endpoint types for the last element, ensuring they do not match.
type DistinctEndpointType<E extends [EndpointType, number?, EndpointType?]> = 
  E extends [infer First, number?, EndpointType?]
  ? First extends EndpointType
    ? [First, number?, EndpointResultType<First>?]
    : ["Error: First type must be a valid EndpointType", First]
  : never;
// With the three types above, the type will not allow duplicate types
type Endpoint = DistinctEndpointType<[EndpointType, number?, EndpointType?]>;
```

### OnResultFunction

```ts
// Type of function that will be called when the query is finished, and passes the results as an array
type OnResultFunction<Type extends MarvelResult> = (
  data: Type[]
) => void | Promise<unknown>;
```

### ParameterMap

```ts
// A map of parameter types by endpoint.
type ParameterMap = {
  comics: ComicParams;
  characters: CharacterParams;
  creators: CreatorParams;
  events: EventParams;
  stories: StoryParams;
  series: SeriesParams;
};
```

### ParamsType{#resulttype}

```ts
// ParamsType is a utility type designed to determine the expected parameters for a given API endpoint. It uses conditional types to map an endpoint to its corresponding parameters, providing type safety and clarity when constructing API requests.
type ParamsType<Endpoint extends readonly unknown[]> = Endpoint extends [
  infer First,
  infer Second,
  infer Third
] // Does the Endpoint have three elements?
  ? Third extends EndpointType // Is the third element a data type?
    ? ParameterMap[Third] // The third element is the data type
    : never
  : Endpoint extends [infer First, infer Second] // Does the Endpoint have two elements?
  ? Second extends number // Is the second element a number?
    ? never // No parameters when the endpoint is for an individual item
    : never
  : Endpoint extends [infer First] // Is the endpoint only one element?
  ? First extends EndpointType // Is the element a data type?
    ? ParameterMap[First] // The element is the data type
    : never
  : APIBaseParams;
```

*Reference [`ParameterMap`](#parametermap) where each type is assigned to an endpoint*

### ResultMap

```ts
// A map of result types by endpoint.
type ResultMap = {
  comics: MarvelComic;
  characters: MarvelCharacter;
  creators: MarvelCreator;
  events: MarvelEvent;
  stories: MarvelStory;
  series: MarvelSeries;
};
```

### ResultType

```ts
// ResultType is a utility type designed to determine the expected data type returned from a given API endpoint. It uses conditional types to map an endpoint to its corresponding type of results.
type ResultType<Type extends Endpoint> =
  DataType<Type> extends EndpointType ? ResultMap[DataType<Type>] : never;
```

*Reference [`ResultMap`](#resultmap) where each type is assigned to an endpoint*
