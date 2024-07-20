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
npm i marvelquery
```

## Setup

1. Initialization:

   - Set your Marvel API public and private keys using MarvelQuery.init.
   - Optionally configure global parameters, callbacks, and other settings.

   ```ts
   import MarvelQuery from "marvelquery";

   const createQuery = MarvelQuery.init({
     publicKey: "your-public-key",
     privateKey: "your-private-key",
   });
   ```

2. Building a Query:
   - Use the createQuery function with an endpoint (e.g., characters) and optional parameters.
   - The library automatically validates the parameters against pre-defined types.
3. Fetching Data:
   - Call the fetch method on the MarvelQuery object.
   - It constructs the URL with authentication details and your parameters.
   - Zod ensures the response structure adheres to the expected schema.
4. Handling Results:
   - The fetch method returns a MarvelQueryResult object containing:
     - Fetched data (characters, comics, etc.)
     - Metadata about the request
     - Response data from the API
   - You can access individual results or the entire set.
5. Pagination:
   - The MarvelQueryResult object allows for effortless pagination. Simply call fetch again to retrieve subsequent pages of results.
