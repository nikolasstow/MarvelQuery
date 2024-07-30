# Getting Started

## Installation

```bash npm2yarn
npm i marvelquery axios
```

*Note: You can exclude axios if it's already in your project or if you plan to substitute your own http client.*

## Setup

MarvelQuery.init() has two arguments, [`APIKeys`](#apikeys) and [`configuration options`](#config)

```ts
const createQuery = MarvelQuery.init({
    publicKey: "your-public-key",
    privateKey: "your-private-key",
  }, {
    // Configuration options...
  });
```

## Creating a Query

```ts
// A query is made up of two parts, the endpoint and the parameters

const spiders = await createQuery(["characters"], {
  nameStartsWith: "Spider",
});

// The endpoint is an array with 1 to 3 elements

["comics"] // Search for comics
["comics", 98310] // Search for a comic with it's ID
["comics", 98310, "characters"] // Search for characters in a specific comic
//  ^                     ^
// These are data types and they determine the type of data the API will return.

["comics"] // returns MarvelComic[]
["comics", 98310] // returns MarvelComic[] (length = 1)
["comics", 98310, "characters"] // returns MarvelCharacter[]

// The endpoint data types also determine the parameters available for the query.

// With a single element in the endpoint, that will be the data type.
const thisWeek = createQuery(["comics"], {
  dateDescriptor: "thisWeek", // Parameters for "comics" (ComicParams)
});

// The second element is always an id. Without a third element, your endpoint represents a single item and therefore no need for parameters.
const sheHulk = createQuery(["comics", 409]);

// When you add a third element, another data type, you are searching for items of that type that are linked to the id in the endpoint.
// For that reason, the data type of the third element dictates the parameters available for that endpoint.
const sheHulk = createQuery(["comics", 409, "creators"], {
  firstName: "Dan", // Parameters for "creators" (CreatorParams)
  lastName: "Slott",
});
```

## Retrieving Results

```ts
// To fetch data with your query, call .fetch() and don't forget to add "await".

const slottsSheHulk = await createQuery(["creators", 12983, "comics"], {
  format: "comic",
  characters: 1009583 // She-Hulk
}).fetch(); // Fetches comics by Dan Slott and featuring She-Hulk

// OR

const query = createQuery(["creators", 12983, "comics"], {
  format: "comic",
  characters: 1009583
});

const slottsSheHulk = await query.fetch()

// If you call fetch again, you'll get the next page of results.
await slottsSheHulk.fetch();
// And then the next...
await slottsSheHulk.fetch();
// Until there are no more results left

// When searching for a single item, use fetchSingle() to request only one result.
const spiderMan = await createQuery(["characters"], {
    name: "Peter Parker",
  }).fetchSingle();
```

The [`fetch()`](#marvelquery) and `fetchSingle()` functions return a [`MarvelQueryResult`](#marvelqueryresult) object containing the data returned by the request and helper functions. This includes the query `url`, `metadata` (code, status, copyright), `responseData` (offset, limit, total, count), `result` (a single result item), `results` (array of results), and `resultHistory` (The combined results of all requests with this query).

```ts
// Using the properties of MarvelQueryResult

const slottsSheHulk = await createQuery(["creators", 12983, "comics"], {
  format: "comic",
  characters: 1009583
})
	.fetch() // Fetches comics by Dan Slott and featuring She-Hulk
  .then((query) => query.results); // Return just the results


const characters = await createQuery(["comics", 98310, "characters"])
  .fetch() // Fetch characters in this comic (id # 98310)
  .then((query) => query.results.map((character) => character.name)); // Return an array of character names.

// TODO: Move offset change to constructor?
```



| Property        | Type                                  | Description                                              |
| --------------- | ------------------------------------- | -------------------------------------------------------- |
| `url`           | `string`                              | The URL generated for the API request.                   |
| `metadata`      | [`Metadata`](#metadata)               | Metadata included in the API response.                   |
| `responseData`  | [`APIResponseData`](#apiresponsedata) | Data for the API response.                               |
| `result`        | [`ResultType<Type>`](#resulttype)     | The first result of the query.                           |
| `results`       | [`ResultType<Type>[]`](#resulttype)   | The results of the query.                                |
| `resultHistory` | [`ResultType<Type>[]`](#resulttype)   | The conjunction of all results from this query instance. |

## Configuration Options

**Global Parameters**

```ts
const createQuery = MarvelQuery.init({ ... }, {
  // Global parameters
  all: { // Applies to all queries
    limit: 10
  },
  comics: { // Applies to all queries of type 'comics'
    noVariants: true
  },
});
```

**Custom HTTP Client**

```ts
// In this example we'll use the axios package, but you can use whichever http client you prefer.

// Map to store ongoing requests for de-duping
const cache = new Map<string, Promise<any>>();

const createQuery = MarvelQuery.init({ ... }, {
  // Global parameters
  fetchFunction: (url: string): Promise<unknown> => {
    if (cache.has(url)) return cache.get(url)!;
  
    const promise = new Promise<unknown>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
  
      axios.get(url).then((response) => {
        clearTimeout(timeout);
        resolve(response.data);
      }).catch((error) => {
        clearTimeout(timeout);
        reject(error);
      }).finally(() => {
        cache.delete(url);
      });
    });
  
    cache.set(url, promise);
    return promise;
  }
});
```

