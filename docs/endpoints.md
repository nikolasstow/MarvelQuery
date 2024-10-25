# Endpoints

An endpoint in the Marvel API is represented as a string (e.g., "comics/1323/characters"), where each part separated by a forward slash (/) defines the type, ID, and collection type. In the MarvelQuery library, this string format is converted into a **tuple** (e.g., ["comics", 1323, "characters"]) for consistency and easier manipulation.

Each endpoint corresponds to a specific type of resource—such as comics, characters, or events—and is essential for directing queries to the right data. In the MarvelQuery library, endpoints are represented as tuples, offering a structured and type-safe way to build queries programmatically. This approach allows you to navigate between different resources efficiently by embedding related resource paths directly into the API response.

## `EndpointType`

The EndpointType union defines the six primary data types in the Marvel API. These types correspond to the root-level endpoints for various Marvel resources: comics, characters, creators, events, series, and stories.

```ts
/**
 * Represents the core data types in the Marvel API.
 * These are the root-level endpoints for various Marvel resources.
 */
type EndpointType = "comics" | "characters" | "creators" | "events" | "series" | "stories";
```

## `Endpoint`

The endpoint tuple is defined by the Endpoint type, which can contain up to three elements:

```ts
type Endpoint = [EndpointType, number?, EndpointType?];
```

- **First element**: Specifies the type of the subject of your query (e.g. `"comics"`, `"characters"`). This is the only required element, allowing you to search the entire Marvel API for items of that type.
- **Second element** (optional): Represents the ID of a specific item within the data type defined by the first element (e.g., `["characters", 1009466]` queries a character with the id `1009466`). Including this element allows you to target a particular resource rather than querying all items of that type.
- **Third element** (optional): Represents a collection of resources related to the specific resource identified by the first two elements. While a two-element endpoint targets a single resource, adding a third element queries a collection of related resources. The third element specifies the type of this collection (e.g., `"creators"`, `"events"`), but the type used here must differ from the type in the first element.

By using this tuple structure, the library provides a more organized way to define the endpoint, while internally converting it back into the string format required by the Marvel API.

## Querying

### Single Element Queries

When querying an entire category (e.g., all comics), you can omit the brackets for convenience. Instead of writing ["comics"], you can simply use "comics" directly. This format is functionally equivalent and can be used like this:

```ts
query("comics", { titleStartsWith: "Spider" });
```

## Example 1: Query All Comics Released This Week

This query targets all comics released this week. Since we are querying an entire category, we can omit the brackets and use "comics" directly.

```ts
query("comics", {
  dateDescriptor: "thisWeek"
}).fetch()
  .then(api => api.results); // returns Comic[]
```

## Example 2: Find a Character by Name

In this example, we query for a character by name. Here, we use the nameStartsWith parameter to find any characters whose names begin with the specified string.

```ts
query("characters", {
  nameStartsWith: "Stilt-Man"
}).fetchSingle()
  .then(api => api.result.id); // returns 1009627
```

## Example 3: Query a Character by ID

If you already know the character’s ID, you can query them directly by specifying the ID in the second element of the endpoint.

```ts
await query(["characters", 1009627]).fetchSingle(); // returns Character;
```

## Example 4: Fetch All Comics a Character Appears In

Using the character’s ID, we can fetch all the comics they appear in. In this case, we’re also filtering the results to exclude variant comics by using the noVariants parameter.

```ts
await query(["characters", 1009627, "comics"], {
  noVariants: true, // filters out variants
}).fetch()
  .then(api => api.results); // returns Comic[]
```

## Example 5: Fetch All Events a Character is Part Of

Here, we’re querying for all the events a character is part of by using the third element in the endpoint to specify "events". This will return a list of events related to the character.

```ts
await query(["characters", 1009627, "events"])
  .fetch()
  .then(api => api.results); // returns Event[]
```

[← Back](marvel-query.md) | [Table of Contents](table-of-contents.md) | [Next: **Refining Queries with IDLists →**](examples.md)
