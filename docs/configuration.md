## Initialization: `MarvelQuery.init()`

The `init` function initializes the MarvelQuery library with your API keys and configuration settings. It returns the `createQuery` function, ensuring that no queries can be created without proper initialization.

```ts
const createQuery = MarvelQuery.init({
    publicKey: "your-public-key",
    privateKey: "your-private-key",
  }, {
    // Configuration options...
  });
```

## `APIKeys`

| Property     | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `publicKey`  | `string` | Marvel API public key as set during initialization.  |
| `privateKey` | `string` | Marvel API private key as set during initialization. |

## `Config`

| Property        | Type                           | Description                                                  |
| --------------- | ------------------------------ | ------------------------------------------------------------ |
| `globalParams`  | `GlobalParams`                 | Global parameters to be applied to all queries, or all queries of a specific type. |
| `omitUndefined` | `boolean`                      | Remove undefined parameters from queries.                    |
| `verbose`       | `boolean`                      | Enabled detailed logging for debugging.                      |
| `onResult`      | `OnResultMap`                  | A map of functions to be called when all results, or results of a specific type, are returned. |
| `onRequest`     | ` (url: string) => void`       | A function that is called for each request. Useful for monitoring your API usage. |
| `httpClient`    | [`HTTPClient`](#fetchfunction) | Replace the default fetch function (axios) with your own HTTP client. |

## Configuration Options and Examples

### `globalParams`

Set global parameters during initialization and they will be applied to all queries. Set globals on a type-by-type basis, or set globals that apply to every query.

```ts
const createQuery = MarvelQuery.init({ ... }, {
  globalParams: { // Global parameters
    all: { // Applies to all queries
      limit: 10,
    },
    comics: { // Applies to all queries of type 'comics'
      noVariants: true,
    },
  },
});
```

### `onRequest`

Provide a custom function that runs on every request, receiving the URL, endpoint, and parameters of that request. This allows you to track your API usage or perform additional actions with the request data.

```ts
const createQuery = MarvelQuery.init({ ... }, {
  onRequest: (url, endpoint, params) => {
    console.log(`Requesting ${url}`);
    console.log(`Endpoint:`, endpoint);
    console.log(`Parameters:`, params);
  }
});
```

### `onResult`

Configure functions to run whenever a result of any type or of a specific type is returned by the API.

```ts
const createQuery = MarvelQuery.init({ ... }, {
  onResult: {
    any: (data) => console.log(data),
    comics: (comics) => {
      comics.map((comic) => {
        console.log("Saving comic:", comic.title);
      })
    }
  }
});
```

### `httpClient`

Replace the default http client with one of your choosing, implement your own strategy for caching and de-duping. No limits, do things the way you like them, MarvelQuery won't stand in your way.

```ts
// In this example we'll use the axios package, but you can use whichever http client you prefer.

// Map to store ongoing requests for de-duping
const cache = new Map<string, Promise<any>>();

const createQuery = MarvelQuery.init({ ... }, {
  // Global parameters
  httpClient: (url: string): Promise<unknown> => {
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

## Creating a Query: `createQuery()`

The createQuery function, returned by init, creates a new instance of MarvelQuery for executing API queries. It validates the endpoint and parameters, leveraging the initialization settings to ensure valid requests.

```ts
const character = await createQuery(["characters"], {
  nameStartsWith: "Stilt-Man",
}).fetch();
```

To learn more about the creating a query I recommend referencing the [Creating a Query](#creatingaquery) section in the [Getting Started](#gettingstarted) guide.