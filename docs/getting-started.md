# Getting Started

## Installation

This package is currently in **release candidate** phase (version 1.0.0-rc.1). All core features are complete, with only documentation finalization remaining before the stable release. To install this release candidate, use the @next tag.

```bash npm2yarn
npm install marvelquery@next
```

This library is designed to be flexible with your choice of HTTP client. By default, it uses axios for making requests, but you are free to use any client that fits your needs. If you prefer to use the default setup with axios, you will need to install it as a **peerDependency**:

```shell
npm install axios
```

## Setup

To get started, initialize the library with your API keys and any desired [configuration options](configuration.md) by calling `MarvelQuery.init()`.

```ts
const query = MarvelQuery.init({
    publicKey: "your-public-key",
    privateKey: "your-private-key",
  }, {
    // Configuration options...
  });
```

This returns a function, referred to as query throughout the documentation, though you can name it as you prefer. The function accepts two arguments: the [endpoint](endpoints.md) and the [parameters](api-parameters.md), and is responsible for creating an instance of [MarvelQuery](marvelquery.md).

# Creating a Query

A query consists of two components: the endpoint and its associated parameters, structured as `query(endpoint, parameters).`

## Defining Your Endpoint

The endpoint is a tuple containing 1 to 3 elements that specify the target location for data retrieval and determine the type of results returned.

```ts
["comics"] // Search for all comics
["comics", 98310] // Search for a specific comic by its ID
["comics", 98310, "characters"] // Search for characters within a specific comic
//  ^                     ^
// These elements represent data types and determine the type of data returned by the API.
```

One of the most common queries involves targeting an entire data type while using parameters to filter the results. When you don’t have an ID for a specific resource or collection, your endpoint will simply be the data type (e.g., “comics” or “characters”). In cases where the endpoint is a single data type, you can omit the tuple brackets for simplicity:

```ts
const spiders = await query("characters"); // "characters" instead of ["characters"]
```

*Learn more about [Endpoints](endpoints.md)*.

## Adding Parameters

The data type returned by an endpoint determines the available parameters for the query. For instance, when querying a single data type without an ID, parameters related to that data type can be included to filter the results:

```ts
const thisWeek = query("comics", {
  dateDescriptor: "thisWeek", // Parameters for "comics" (ComicParams)
});
```

When the endpoint includes a second element that’s an ID, and no third element is specified, you’re referring to a specific item. In this case, additional parameters are not needed:

```ts
const sheHulk = query(["comics", 409]);
```

When you introduce a third element, you’re requesting related items within the specified resource. The third element indicates the type of related data, and determines the available parameters:

```ts
const sheHulkCreators = query(["comics", 409, "creators"], {
  firstName: "Dan", // Parameters for "creators" (CreatorParams)
  lastName: "Slott",
});
```

## Retrieving Results

To fetch data from your query, use the .fetch() method on the MarvelQuery object. This is asynchronous, so ensure you use await. Alternatively, use the .fetchSingle() method when you expect a single result, such as when querying a specific character or creator.

Note: The type of data returned depends on your configuration and the fetch method:

- With AutoQuery turned on, the data types are the same as the endpoint type only singular with the first letter capitalized (e.g., "comics" becomes Comic).
- With AutoQuery turned off, the data types are prepended with '**Marvel**' (e.g., MarvelComic, MarvelEvent, MarvelCharacter, etc.)

### `.fetch()`

The .fetch() method returns the MarvelQuery instance itself, with the results populating the .results property. Since it returns the instance, methods can be chained for further querying.

```ts
// Fetch data using .fetch() and ensure you include "await".

const slottsSheHulk = await query(["creators", 12983, "comics"], {
  format: "comic",
  characters: 1009583 // She-Hulk
}).fetch(); // Fetches comics by Dan Slott featuring She-Hulk

// The results are now in the .results property of the query instance:
console.log(slottsSheHulk.results); // e.g., MarvelComic[] or Comic[]

// Calling .fetch() again on the instance retrieves the next page of results:
await slottsSheHulk.fetch(); // Fetches the next page
await slottsSheHulk.fetch(); // Fetches the following page

// To retrieve all available results, use a while loop with the .isComplete property:
while (!slottsSheHulk.isComplete) {
  await slottsSheHulk.fetch(); // Continues until all results are fetched
}
```

### `.fetchSingle()`

The .fetchSingle() method returns a single result item, and you cannot call .fetch() again on it. However, with AutoQuery enabled, you can use methods injected into the result to perform further queries, such as searching for related items.

```ts
const spiderMan = await query("characters", {
  name: "Peter Parker",
}).fetchSingle(); // Retrieves a single character (MarvelCharacter or Character)

// If AutoQuery is enabled, you can chain methods directly on the result:
const amazingSpiderMan = await spiderMan.comics.query({
  titleStartsWith: "Amazing"
}).fetch(); // Fetches all Amazing Spider-Man comics

// OR use promises:
query("characters", {
  name: "Peter Parker",
}).fetchSingle()
  .then(peter => peter.comics.query({
    titleStartsWith: "Amazing"
  }).fetch());
```

[Next: **Explore MarvelQuery Properties and Methods →**](marvel-query.md)

