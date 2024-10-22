# AutoQuery Methods

Now that you've seen where and how AutoQuery injects methods into results, let's review how these methods work.

## Resource Methods

Each resource in the result data gains three new methods: `query()`, `fetch()`, and `fetchSingle()`. These methods are similar to those on a MarvelQuery instance, making them intuitive to use.

- `fetch()`: Retrieves the full resource and returns it wrapped in a MarvelQuery instance.
- `fetchSingle()`: Fetches the resource as a single result and returns it directly, rather than inside a query instance.
- `query()`: Allows you to request **related resources**, also known as **collections**, using a familiar format. For example, you can use it to retrieve all comics associated with a character or events linked to a creator. This method only accepts an [EndpointType](endpoints.md#EndpointType) as its first argument, representing the type of collection you’re querying. The result is a new MarvelQuery instance, which can be fetched using the same methods (`fetch()` and `fetchSingle()`)

## Collection Methods

Unlike individual resources, **collections** gain only a single new method: `query()`. This version of the `query()` method differs slightly—it accepts only one argument: optional parameters to filter the contents of the collection. As with other query methods, it returns a MarvelQuery instance, which can be fetched using the same `fetch()` and `fetchSingle()` methods.

Below is a comparison of the three different query methods to clarify how they work across the library.

### Standard `query()` Method

This method is returned by the `MarvelQuery.init()` function after setting your API keys and configuration. It accepts either an [Endpoint](endpoints.md#Endpoint) or an [EndpointType](endpoints.md#EndpointType) as the first argument, and query parameters of the corresponding type as the second argument, allowing you to retrieve data based on the specific API endpoint.

```ts
type InitialQuery = <T extends Endpoint | EndpointType>(
  endpoint: T,
  params?: Params<AsEndpoint<T>>
) => MarvelQueryInstance<AsEndpoint<T>>;
```

### Resource `query()` Method

The `query()` method injected into resources differs from the standard version by accepting only an [EndpointType](endpoints.md#EndpointType) as its first argument. This method is designed to query **related collections** for a specific resource.

```ts
type QueryResource<E extends Endpoint> = <T extends NoSameEndpointType<E>>(
  endpoint: T,
  params?: Params<AsEndpoint<T>>
) => MarvelQueryInstance<AsEndpoint<T>>;
```

*Note: NoSameEndpointType is a utility type that ensures the resource’s own EndpointType is excluded from the [EndpointType union](endpoints.md#EndpointType) to avoid circular queries (e.g., an event querying events).*

### Collection `query()` Method

Unlike the resource and standard query methods, this version doesn’t require an [Endpoint](endpoints.md#Endpoint)or [EndpointType](endpoints.md#EndpointType) as an argument. Instead, the type of parameters it accepts is defined by the **collection** from which it’s called, allowing you to filter and refine the contents of the collection itself.

```ts
type QueryCollection<E extends Endpoint> = (
  params?: Params<E>
) => MarvelQueryInstance<E>;
```

These query methods provide flexibility and consistency across the library, whether you’re querying entire categories, individual resources, or filtering collections. With AutoQuery, you gain powerful tools for multi-step queries that keep your code readable and concise.

[Next: **Take Your Queries Further with AutoQuerying** →](autoquery-examples.md)