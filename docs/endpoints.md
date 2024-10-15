# Endpoints

## `EndpointType`

The EndpointType union defines the six primary data types in the Marvel API. These types correspond to the root-level endpoints for various Marvel resources: comics, characters, creators, events, series, and stories.

```ts
/**
 * Represents the core data types in the Marvel API.
 * These are the root-level endpoints for various Marvel resources.
 */
type EndpointType = "comics" | "characters" | "creators" | "events" | "series" | "stories";
```

## `Endpoint` *(path as tuple)*

An endpoint in the Marvel API is represented as a string (e.g., `"comics/1323/characters"`), where each part separated by a forward slash ( `/` ) defines the type, ID, and collection type. In the MarvelQuery library, this string format is converted into a **tuple** (e.g., `["comics", 1323, "characters"]`).

The tuple is defined by the Endpoint type, which can contain up to three elements:

```ts
type Endpoint = [EndpointType, number?, EndpointType?];
```

- **First element**: Specifies the type of the subject of your query (e.g. `"comics"`, `"characters"`). This is the only required element, allowing you to search the entire Marvel API for items of that type.
- **Second element** (optional): Represents the ID of a specific item within the data type defined by the first element (e.g., `["characters", 1009466]` queries a character with the id `1009466`). Including this element allows you to target a particular resource rather than querying all items of that type.
- **Third element** (optional): Represents a collection of resources related to the specific resource identified by the first two elements. While a two-element endpoint targets a single resource, adding a third element queries a collection of related resources. The third element specifies the type of this collection (e.g., `"creators"`, `"events"`), but the type used here must differ from the type in the first element.

By using this tuple structure, the library provides a more organized way to define the endpoint, while internally converting it back into the string format required by the Marvel API.

## `EndpointDescriptor`

In addition to the Endpoint tuple, the library defines the EndpointDescriptor interface. This interface helps describe the endpoint more precisely by including both the tuple path and the specific data type of the endpoint.

```ts
interface EndpointDescriptor<E extends Endpoint> {
  path: E; // The Endpoint tuple
  type: DataType<E>; // The core data type from EndpointType
}
```

## Querying

### Single Element Queries

When querying an entire category (e.g., all comics), you can omit the brackets for convenience. Instead of writing `["comics"]`, you can simply use "comics" directly. This format is functionally equivalent and can be used like this:

```ts
query("comics", { titleStartsWith: "Spider" });
```

### Let's look at a few examples: 

```ts
/** Query all comics released this week.
 * Since this query targets all comics, only one element is needed, 
 * so the brackets can be omitted.
 */
await query("comics", {
  dateDescriptor: "thisWeek"
}).fetch()
  .then(api => api.results); // returns Comic[]

// Now, let’s find a character by name:
await query("characters", {
  nameStartsWith: "Stilt-Man"
}).fetchSingle()
  .then(api => api.result.id); // returns 1009627

// If you already know the character's ID, you can query them directly:
await query(["characters", 1009627]).fetchSingle(); // returns Character;

// You can also use the character’s ID to fetch all the comics they appear in:
await query(["characters", 1009627, "comics"], {
  noVariants: true, // filters out variants
}).fetch()
  .then(api => api.results); // returns Comic[]

// Or, retrieve all the events the character is part of:
await query(["characters", 1009627, "comics"])
  .fetch()
  .then(api => api.results); // returns Event[]
```

[**Next: Parameters to Refine Your Query** →](api-parameters.md)
