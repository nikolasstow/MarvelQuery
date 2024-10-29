# MarvelQuery

Unlock the full potential of the Marvel API with unmatched type safety and flexibility.

Designed for TypeScript, this library offers a seamless, developer-friendly way to interact with the Marvel API. Whether you’re building small features or full-fledged applications, MarvelQuery ensures you work confidently, knowing your code is reliable, maintainable, and ready to tap into the vast world of Marvel Comics.

## **Key Features:**

- **Unmatched Type Safety:** Every data type and parameter is meticulously defined, preventing errors caused by typos or incorrect data structures. Zod validation further strengthens this foundation, ensuring data integrity throughout your application.
- **Enhanced Developer Experience:**
  - **Intelligent Autocompletion:** Type definitions guide your IDE, suggesting relevant options and data types as you code, streamlining development.
  - **AutoQuery Injection:**  Result data is injected with methods and properties at each URI, allowing you to easily fetch and query related resources and collections directly from the data structure.
  - **Catch Errors Early:** Invalid queries are identified during development, providing specific error messages to pinpoint issues quickly.
- **Flexible Configuration:**
  - **Global Parameters:** Establish default settings applicable to all queries or specific categories of queries (such as comics or characters).
  - **Override with Ease:** Override global defaults with specific values for individual queries, allowing for granular control.
  - **Customizable Behavior:** Define callbacks for request and response handling to tailor the library's behavior to your needs.
  - **Swappable HTTP Client:** Integrate seamlessly with your preferred HTTP client (e.g., Fetch, SuperAgent) by replacing the default implementation.

## Installation

```bash npm2yarn
npm i marvelquery axios
```

## Initialization

Before diving into the examples, you need to initialize the library with your API keys. If you do not have API keys, visit the [Marvel Developer Portal](https://developer.marvel.com) to get started.

```ts
import MarvelQuery from "marvelquery";

const query = MarvelQuery.init({
  publicKey: "your-public-key",
  privateKey: "your-private-key",
})
```

Now that you’ve set up the library let’s look at a few quick examples. For a more in-depth explanation of how the library works and what options are available, visit the [Getting Started](docs/getting-started.md) page.

## Example 1: Fetching This Week’s Comics

```ts
// Let's start with a simple task: fetching this week's comics.
const comics = query("comics", {
  dateDescriptor: "thisWeek",
})
  .fetch() // Calling .fetch() returns a promise that resolves to the MarvelQuery instance.
  .then((instance) => instance.results); // Once resolved, the results property becomes populated.
```

## Example 2: Fetching Comics Featuring a Specific Character

```ts
// First, we need to find the character named "Peter Parker."
const peter = await query("characters", {
  name: "Peter Parker",
}).fetchSingle();

/** fetchSingle() gives us a single result—here, a 'Character' type.
 * The 'comics' property contains a collection of comics featuring Peter,
 * with a 'query' method for further API queries.
 */
const spiderComics = await peter.comics.query({
    format: "comic",
    noVariants: true,
    dateDescriptor: "nextWeek",
  })
  .fetch(); // Resolves to an instance populated with Spider-Man comics.
```

## Example 3: Fetching a Specific Resource

```ts
// Adding an ID to the endpoint will query a specific resource.
const blackCat = await query(["characters", 1009335])
	.fetchSingle(); // Resolves to a 'Character' object (Felicia Hardy)
```

## Example 4: Fetching Related Resources

```ts
 // Adding a third element queries a related collection of items.
const blackCatComics = await query(["characters", 1009335, "comics"])
	.fetch(); // Resolves to an instance populated with comics featuring Felicia Hardy.
```

For more information and to get started, please visit the [Getting Started](docs/getting-started.md) guide or explore the [Table of Contents](table-of-contents.md).
