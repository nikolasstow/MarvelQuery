# MarvelQuery

Unleash the Power of the Marvel API with Type Safety and Flexibility.

This TypeScript library provides a robust and developer-friendly way to interact with the Marvel API. Built with a focus on type safety and flexibility, it empowers you to build reliable and maintainable applications that leverage the rich world of Marvel Comics.

## **Key Features:**

- **Unmatched Type Safety:** Every data type and parameter is meticulously defined, preventing errors caused by typos or incorrect data structures. Zod validation further strengthens this foundation, ensuring data integrity throughout your application.
- **Enhanced Developer Experience:**
  - **Intelligent Autocompletion:** Type definitions guide your IDE, suggesting relevant options and data types as you code, streamlining development.
  - **Catch Errors Early:** Invalid queries are identified during development, providing specific error messages to pinpoint issues quickly.
- **Flexible Configuration:**
  - **Global Parameters:** Set default parameters that apply to all queries or all queries of a specific type (e.g., comics, characters).
  - **Override with Ease:** Override global defaults with specific values for individual queries, allowing for granular control.
  - **Customizable Behavior:** Define callbacks for request and response handling to tailor the library's behavior to your specific needs.
  - **Swappable HTTP Client:** Integrate seamlessly with your preferred HTTP client (e.g., Fetch, SuperAgent) by replacing the default implementation.

## Installation

```bash npm2yarn
npm i marvelquery axios
```

## Example

```ts
import MarvelQuery from "marvelquery";

const query = MarvelQuery.init({
  publicKey: "your-public-key",
  privateKey: "your-private-key",
});

// Let's find out what Spider-Man is currently up to in the comics.

// First we need to find his id using his name.
const peterParker = await query(["characters"], {
  name: "Peter Parker",
})
  .fetchSingle()
  .then((query) => query.result.id); // Returns '1009491'

// The we can use that id to create a new query to get the latest comics he appears in.
const spiderComics = await query(["characters", peterParker, "comics"], {
  format: "comic",
  noVariants: true,
  dateDescriptor: "nextWeek",
})
  .fetch()
  .then((query) => query.results);
```

For more information and to get started, please visit the [Getting Started](./getting-started.md) guide.
