# MarvelQuery

Unleash the Power of the Marvel API with Type Safety and Flexibility.

This TypeScript library provides a robust and developer-friendly way to interact with the Marvel API. Built with a focus on type safety and flexibility, it empowers you to build reliable and maintainable applications that leverage the rich world of Marvel Comics.

## **Key Features:**

- **Unmatched Type Safety:** Every data type and parameter is meticulously defined, preventing errors caused by typos or incorrect data structures. Zod validation further strengthens this foundation, ensuring data integrity throughout your application.
- **Enhanced Developer Experience:**
  - **Intelligent Autocompletion:** Type definitions guide your IDE, suggesting relevant options and data types as you code, streamlining development.
  - **AutoQuery Injection:** Automatically injects methods and properties into API responses, enabling effortless creation of follow-up queries based on the data returned. This allows you to seamlessly explore related comics, characters, creators, and more without manually building new queries.
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
  dateDescriptor: "thisWeek"
}).fetch() // Calling .fetch() returns a promise that resolves to the MarvelQuery instance.
  .then(instance => instance.results); // Once resolved, the results property becomes populated.

// Now, let's take it a step further and fetch comics featuring a specific character.
// First, we need to find the character named "Peter Parker."
const peter = await query("characters", {
  name: "Peter Parker",
}).fetchSingle(); // The .fetchSingle() method returns a single result instead of the instance (MarvelCharacter).

// We can now access the comics collection from 'peter'
const spiderComics = await peter.comics // AutoQuery injects a query method for related resources like comics.
  .query({ 
    format: "comic",
    noVariants: true,
    dateDescriptor: "nextWeek"
  })
  .fetch(); // Fetch the results of this refined query.

  // Now let's move away from simple endpoints, with two elements we can fetch a specific resource.
  const blackCat = await query(["characters", 1009335]).fetchSingle(); // Fetch the character with the ID 1009335.
  // And when you add a third element, you query related resources.
  const blackCatComics = await query(["characters", 1009335, "comics"]).fetch(); // Fetch comics featuring Felicia Hardy.
```

For more information and to get started, please visit the [Getting Started](./getting-started.md) guide.
