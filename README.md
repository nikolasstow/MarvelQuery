# MarvelQuery

Unlock the full potential of the Marvel API with unmatched type safety and flexibility.

Designed for TypeScript, this library offers a seamless, developer-friendly way to interact with the Marvel API. Whether you’re building small features or full-fledged applications, MarvelQuery ensures you work with confidence, knowing your code is reliable, maintainable, and ready to tap into the vast world of Marvel Comics.

## **Key Features:**

- **Unmatched Type Safety:** Every data type and parameter is meticulously defined, preventing errors caused by typos or incorrect data structures. Zod validation further strengthens this foundation, ensuring data integrity throughout your application.
- **Enhanced Developer Experience:**
  - **Intelligent Autocompletion:** Type definitions guide your IDE, suggesting relevant options and data types as you code, streamlining development.
  - **AutoQuery Injection:**  Result data is injected with methods and properties at each URI, allowing you to easily fetch and query related resources and collections directly from the data structure.
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

// Let's start with a simple task: fetching this week's comics.
const comics = query("comics", {
  dateDescriptor: "thisWeek",
})
  .fetch() // Calling .fetch() returns a promise that resolves to the MarvelQuery instance.
  .then((instance) => instance.results); // Once resolved, the results property becomes populated.

// Now, let's take it a step further and fetch comics featuring a specific character.
// First, we need to find the character named "Peter Parker."
const peter = await query("characters", {
  name: "Peter Parker",
}).fetchSingle();
/** Unlike the .fetch() method, which returns an instance, .fetchSingle() gives us
 * a single result—here, a 'Character' type.
 * 
 * When accessing the 'comics' property, we find a collection of comics featuring Peter,
 * where a 'query' method has been injected to allow further API queries.
 */
const spiderComics = await peter.comics.query({
  /** The endpoint is handled internally, and you can optionally pass parameters to 
   * filter the results.
  */
    format: "comic",
    noVariants: true,
    dateDescriptor: "nextWeek",
  })
  .fetch(); // Resolves to an instance populated with Spider-Man comics

// Now let's move away from simple endpoints, adding an id will query a resource
const blackCat = await query(["characters", 1009335])
	.fetchSingle(); // Resolves to an expert thief ('Character' object)

// And when you add a third element, you query related resources.
const blackCatComics = await query(["characters", 1009335, "comics"])
	.fetch(); // Resolves to an instance populated with comics featuring Felicia Hardy.

```

For more information and to get started, please visit the [Getting Started](./getting-started.md) guide.
