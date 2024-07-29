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
})

// The endpoint is an array with 1 to 3 elements

["comics"] // Search for comics
["comics", 98310] // Search for a comic with it's ID
["comics", 98310, "characters"] // Search for characters in a specific comic
//  ^                     ^
// These are data types and they determine the type of data the API will return

["comics"] // returns MarvelComic[]
["comics", 98310] // returns MarvelComic[] (length = 1)
["comics", 98310, "characters"] // returns MarvelCharacter[]

// The endpoint data types also determine the parameters available for the query

// Run some tests before continueing. I may have broken something
```



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

