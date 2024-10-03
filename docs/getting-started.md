# Getting Started

## Installation

```bash npm2yarn
npm i marvelquery axios
```

*Note: You can exclude axios if it's already in your project or if you plan to substitute your own http client.*

## Setup

First, initialize the library with your API keys and pass in your [configuration options](#config) using the static function `MarvelQuery.init()`.

```ts
const query = MarvelQuery.init({
    publicKey: "your-public-key",
    privateKey: "your-private-key",
  }, {
    // Configuration options...
  });
```

This will return a function referred to in this documentation as `query`, though you can name it anything you like. This function takes two arguments: the [endpoint](#endpoint) and the [parameters](#parameters). As its name suggests, it creates an instance of [MarvelQuery](#marvelquery).

## Creating a Query

A query is made up of two parts, the endpoint and the query parameters: `query(endpoint, parameters )`.

```ts
const spiders = await query(["characters"], {
  nameStartsWith: "Spider",
});
```

### Defining your Endpoint

The endpoint is an tuple containing 1 to 3 elements that specify the target locations for data retrieval and determine the data type of the results.

```ts
["comics"] // Search for comics
["comics", 98310] // Search for a comic with it's ID
["comics", 98310, "characters"] // Search for characters in a specific comic
//  ^                     ^
// These are data types and they determine the type of data the API will return.

["comics"] // returns MarvelComic[]
["comics", 98310] // returns MarvelComic[] (length = 1)
["comics", 98310, "characters"] // returns MarvelCharacter[]
```

### Adding Parameters

The data type returned by an endpoint determines the available parameters for the query. As a general rule, the last data type specified in the endpoint indicates the type of data the query will return.

```ts
// With a single element in the endpoint, that will be the data type.
const thisWeek = query(["comics"], {
  dateDescriptor: "thisWeek", // Parameters for "comics" (ComicParams)
});

// The second element is always an id. Without a third element, your endpoint represents a single item and therefore has no available parameters.
const sheHulk = query(["comics", 409]);

// When you add a third element, another data type, you are searching for items of that type that are linked to the id in the endpoint.
// For that reason, the data type of the third element dictates the parameters available for that endpoint.
const sheHulk = query(["comics", 409, "creators"], {
  firstName: "Dan", // Parameters for "creators" (CreatorParams)
  lastName: "Slott",
});
```

## Retrieving Results

To fetch data with your query, call `.fetch()` on your MarvelQuery object. This is an asynchronous method, so be sure to include `await`. The `fetchSingle()` method also exists, limiting your query to a single result, which is useful when querying a character or creator, or any time one result is all that's expected.

### `.fetch()`

```ts
// To fetch data with your query, call .fetch() and don't forget to add "await".

const slottsSheHulk = await query(["creators", 12983, "comics"], {
  format: "comic",
  characters: 1009583 // She-Hulk
}).fetch(); // Fetches comics by Dan Slott and featuring She-Hulk

// OR

const sheHulkQuery = query(["creators", 12983, "comics"], {
  format: "comic",
  characters: 1009583
});

const slottsSheHulk = await sheHulkQuery.fetch()

// If you call fetch again, you'll get the next page of results.
await slottsSheHulk.fetch();
// And then the next...
await slottsSheHulk.fetch();

// If you want every result available, you can accomplish this with a while loop and the .isComplete property.
while(!latest.isComplete) {
  await latest.fetch(); // This will continue until all results have been received
}
```

### `.fetchSingle()`

When searching for a single item, use fetchSingle() to request only one result.

```ts
const spiderMan = await query(["characters"], {
    name: "Peter Parker",
  }).fetchSingle();
```



The [`fetch()`](#marvelquery) and `fetchSingle()` functions return `this`, the MarvelQuery instance now containing the data returned by the request and helper functions. This includes:

- `url`: The query URL.
- `metadata`: Information such as code, status, and copyright.
- `responseData`: Details like offset, limit, total, and count.
- `result`: A single result item.
- `results`: An array of results.
- `resultHistory`: The combined results of all requests with this query.

```ts
// Using the properties of MarvelQueryResult

const slottsSheHulk = await query(["creators", 12983, "comics"], {
  format: "comic",
  characters: 1009583
})
	.fetch() // Fetches comics by Dan Slott and featuring She-Hulk
  .then((query) => query.results); // Return just the results


const characters = await query(["comics", 98310, "characters"])
  .fetch() // Fetch characters in this comic (id # 98310)
  .then((query) => query.results.map((character) => character.name)); // Return an array of character names.


```

I recommend referencing the [`MarvelQuery`](#marvelquery) documentation for more information about its properties.
