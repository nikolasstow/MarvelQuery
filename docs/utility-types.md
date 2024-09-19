# Endpoints and Utility Types

### Endpoint Tuple

The Marvel API represents an endpoint as a string (e.g., `"comics/1323/characters"`), where each part separated by a slash (`/`) defines the type, ID, and collection type. In the MarvelQuery library, for practical reasons, this string format is converted into a **tuple** (e.g., `["comics", 1323, "characters"]`). A tuple is like an array, but with a fixed structure where each element has a specific meaning and type.

The tuple contains up to three elements:

- **First element**: Specifies the type of the subject of your query (e.g. `"comics"`, `"characters"`). This is the only required element, allowing you to search the entire Marvel API for items of that type.
- **Second element** (optional): Represents an ID, querying a specific item of the data type specified in the first element (e.g., `1009466` for a specific character).
- **Third element** (optional): Represents a collection of resources related to the specific resource identified by the first two elements. While a two-element endpoint targets a single resource, adding a third element queries a collection of related resources. The third element specifies the type of this collection (e.g., `"creators"`, `"events"`), but the type used here must differ from the type in the first element.

By using this tuple structure, the library provides a more organized way to define the endpoint, while internally converting it back into the string format required by the Marvel API.

> **Note**: I am aware that TypeScript supports template literals in types now, but I've been unable to get it working with the same level of type safety and user experience. However, I am open to suggestions.

```ts
/**
 * Let's break down how to use the endpoint in your query.
 * When making a broad search, your endpoint will only consist of a single element: 
 * the data type.
 */

// For example, fetching the latest comics:
const comics = await createQuery(['comics'], {
  dateDescriptor: "thisWeek"
})
  .fetch()
  .then(api => api.results); // returns Comic[]

// Or finding your favorite character:
const stiltMan = await createQuery(['characters'], {
  nameStartsWith: "Stilt-Man"
})
  .fetchSingle()
  .then(api => api.result.id); // returns 1009627

// If you have an ID, you can request that character individually by adding it to the tuple.
const characterEndpoint = ['characters', 1009627];

// Even better, with an ID you can fetch all the comics featuring that character:
const comicsEndpoint = ['characters', 1009627, 'comics'];

// Or all of the events the character appears in:
const eventsEndpoint = ['characters', 1009627, 'events'];

const eventsWithStilts = await createQuery(eventsEndpoint, params)
  .fetch()
  .then(api => api.results); // returns Event[]
```



### `GlobalParams`

The globalParams feature in your library enables you to set default parameters for API queries, streamlining requests and ensuring consistency across different endpoints. By defining these parameters globally, you eliminate redundancy and ensure that specific criteria are consistently applied unless explicitly overridden in individual queries.

| Property     | Type                                  | Description                                                  |
| ------------ | ------------------------------------- | ------------------------------------------------------------ |
| `all`        | [`APIBaseParams`](#apibaseparams)     | Parameters which apply to all requests, and as such are limited to parameters found on all endpoints (`modifiedSince`, `limit`, and `offset`). |
| `comics`     | [`ComicParams`](#comicparams)         | Set default parameters for all api requests for comics.      |
| `characters` | [`CharacterParams`](#characterparams) | Set default parameters for all api requests for characters . |
| `creators`   | [`CreatorParams`](#creatorparams)     | Set default parameters for all api requests for creators.    |
| `events`     | [`EventParams`](#eventparams)         | Set default parameters for all api requests for events.      |
| `stories`    | [`StoryParams`](#storyparams)         | Set default parameters for all api requests for stories.     |
| `series`     | [`SeriesParams`](#seriesparams)       | Set default parameters for all api requests for series.      |

### `OnResultMap`

| Property     | Type                                                     | Description                                                  |
| ------------ | -------------------------------------------------------- | ------------------------------------------------------------ |
| `any`        | [`AnyResultFunction`](#anyresultfunction)                | A function that will be called when a query of any type is finished, unless overridden by a specific onResult function for a particular type. |
| `comics`     | [`OnResultFunction<MarvelComic>`](#onresultfunction)     | A function that will be called when comic results are returned from the API, passing an array of Marvel comics. |
| `characters` | [`OnResultFunction<MarvelCharacter>`](#onresultfunction) | A function that will be called when character results are returned from the API, passing an array of Marvel characters. |
| `creators`   | [`OnResultFunction<MarvelCreator>`](#onresultfunction)   | A function that will be called when creator results are returned from the API, passing an array of Marvel creators. |
| `events`     | [`OnResultFunction<MarvelEvent>`](#onresultfunction)     | A function that will be called when event results are returned from the API, passing an array of Marvel events. |
| `stories`    | [`OnResultFunction<MarvelStory>`](#onresultfunction)     | A function that will be called when story results are returned from the API, passing an array of Marvel stories. |
| `series`     | [`OnResultFunction<MarvelSeries>`](#onresultfunction)    | A function that will be called when series results are returned from the API, passing an array of Marvel series. |

### `AnyResultFunction`

```ts
/**
 * A function that will be called when a query of any type is finished,
 * unless overridden with an onResult function for a specific type.
 */
type AnyResultFunction = OnResultFunction<AnyType>;
```

### `AnyType`

```ts
/**
 * A union type of all Marvel data types.
 */
type AnyType = MarvelComic | MarvelCharacter | MarvelCreator | MarvelEvent | MarvelSeries | MarvelStory;
```

### `DataType`

```ts
/**
 * Utility type that determines the type of data being queried.
 * It works by checking the endpoint and looking for the last data type in the endpoint.
 * If the last element is a type, use it. If it's a number, use the type in the first element.
 */
type DataType<E extends readonly unknown[]> = E extends [
  ...infer _,
  infer LastElement extends EndpointType
]
  ? LastElement extends number
    ? E extends [infer FirstElement, ...unknown[]]
      ? FirstElement
      : never
    : LastElement
  : never;
```

### `EndpointType`, `EndpointResultType`, `DistinctEndpointType`, and `Endpoint` {#endpointtypes}

```ts
/**
 * Data types of the Marvel API are the core of the endpoint.
 */
type EndpointType = "comics" | "characters" | "creators" | "events" | "series" | "stories";

/**
 * Utility type to remove one of the types from the union.
 */
type EndpointResultType<T extends EndpointType> = Exclude<EndpointType, T>;

/**
 * Utility type that infers the type of the first element of the endpoint,
 * so it can be passed to the EndpointResultType. This removes the type of the first element
 * from the available endpoint types for the last element, ensuring they do not match.
 */
type DistinctEndpointType<E extends [EndpointType, number?, EndpointType?]> = 
  E extends [infer First, number?, EndpointType?]
  ? First extends EndpointType
    ? [First, number?, EndpointResultType<First>?]
    : ["Error: First type must be a valid EndpointType", First]
  : never;

/**
 * This type combines the previous types to ensure that the endpoint does not allow 
 * duplicate types.
 */
type Endpoint = DistinctEndpointType<[EndpointType, number?, EndpointType?]>;
```

### `HTTPClient`

```ts
/**
 * Replace the default HTTP client with one of your choosing.
 * 
 * Function type definition:
 */
type HTTPClient = <E extends Endpoint>(
  url: string
) => Promise<APIWrapper<ResultType<E>>>;
/** 
 * Default function:
 */
(url) => axios.get(url).then((response) => response.data);
```

### `OnRequestFunction`

```ts
/**
 * OnRequestFunction is a callback type that is invoked for each request made.
 * It receives the request URL, endpoint, and query parameters.
 */
type OnRequestFunction = (
  url: string,
  endpoint: Endpoint,
  params: Record<string, unknown>
) => void;
```

### `OnResultFunction`

```ts
/**
 * Type of function that will be called when the query is finished, 
 * passing the results as an array.
 */
type OnResultFunction<R extends MarvelResult> = (
  data: R[]
) => void | Promise<unknown>;
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

### `ParamsType`{#paramstype}

```ts
/**
 * ParamsType is a utility type designed to determine the expected parameters 
 * for a given API endpoint. It uses conditional types to map an endpoint to its
 * corresponding parameters, providing type safety and clarity when constructing 
 * API requests.
 */
type ParamsType<E extends readonly unknown[]> = 
  E extends [infer First, infer Second, infer Third] // Does the Endpoint have three elements?
    ? Third extends EndpointType // Is the third element a data type?
      ? ParameterMap[Third] // The third element is the data type
      : never
  : E extends [infer First, infer Second] // Does the Endpoint have two elements?
    ? Second extends number // Is the second element a number?
      ? never // No parameters when the endpoint is for an individual item
      : never
  : E extends [infer First] // Is the endpoint only one element?
    ? First extends EndpointType // Is the element a data type?
      ? ParameterMap[First] // The element is the data type
      : never
  : APIBaseParams;
```

*Reference [`ParameterMap`](#parametermap) where each type is assigned to an endpoint*

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
 * from a given API endpoint. It uses conditional types to map an endpoint to its 
 * corresponding type of results.
 */
type ResultType<E extends Endpoint> = 
  DataType<E> extends EndpointType 
    ? ResultMap[DataType<E>] 
    : never;
```

*Reference [`ResultMap`](#resultmap) where each type is assigned to an endpoint*
