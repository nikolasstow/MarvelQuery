# Endpoints

### Endpoint Tuples{#tuples}

The Marvel API represents an endpoint as a string (e.g., `"comics/1323/characters"`), where each part separated by a slash (`/`) defines the type, ID, and collection type. In the MarvelQuery library, for practical reasons, this string format is converted into a **tuple** (e.g., `["comics", 1323, "characters"]`).

The tuple contains up to three elements:

- **First element**: Specifies the type of the subject of your query (e.g. `"comics"`, `"characters"`). This is the only required element, allowing you to search the entire Marvel API for items of that type.
- **Second element** (optional): Represents an ID, querying a specific item of the data type specified in the first element (e.g., `1009466` for a specific character).
- **Third element** (optional): Represents a collection of resources related to the specific resource identified by the first two elements. While a two-element endpoint targets a single resource, adding a third element queries a collection of related resources. The third element specifies the type of this collection (e.g., `"creators"`, `"events"`), but the type used here must differ from the type in the first element.

By using this tuple structure, the library provides a more organized way to define the endpoint, while internally converting it back into the string format required by the Marvel API.

### Single Element Queries

When querying an entire category (e.g., all comics), you can omit the brackets for convenience. Instead of writing ["comics"], you can simply use "comics" directly. This format is functionally equivalent and can be used like this:

```ts
query("comics", { titleStartsWith: "Spider" });
```

### Let's look at a few examples: {#examples}

> **Note**: I am aware that TypeScript supports template literals in types now, but I've been unable to get it working with the same level of type safety and user experience. However, I am open to suggestions.

```ts
/**
 * Let's break down how to use the endpoint in your query.
 * When making a broad search, your endpoint will only consist of a single element (the data-type),
 * and we can exclude the brackets:
 */

// For example, fetching the latest comics:
const comics = await query("comics", {
  dateDescriptor: "thisWeek"
})
  .fetch()
  .then(api => api.results); // returns Comic[]

// Or finding your favorite character:
const stiltMan = await query("characters", {
  nameStartsWith: "Stilt-Man"
})
  .fetchSingle()
  .then(api => api.result.id); // returns 1009627

// If you have an ID, you can request that character individually by adding it to the tuple.
const characterEndpoint = ["characters", 1009627];

// Even better, with an ID you can fetch all the comics featuring that character:
const comicsEndpoint = ["characters", 1009627, "comics"];

// Or all of the events the character appears in:
const eventsEndpoint = ["characters", 1009627, "comics"];

const eventsWithStilts = await query(["characters", 1009627, "events"])
  .fetch()
  .then(api => api.results); // returns Event[]
```



### Types: `EndpointType`, `EndpointDescriptor`, `EndpointResultType`, `DistinctEndpointType`, and `Endpoint` {#types}

```ts
/**
 * Data types of the Marvel API are the core of the endpoint.
 */
type EndpointType = "comics" | "characters" | "creators" | "events" | "series" | "stories";

/**
 * Endpoint path (["comics", 1234]) and data type
 */

type EndpointDescriptor<E extends Endpoint> = {
  path: E;
  type: DataType<E>;
}

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
