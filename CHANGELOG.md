# MarvelQuery
## 1.0.0-rc.1

  This release marks a significant rewrite of the library, bringing it to production-ready status. Major improvements include:

  - **New Features:** Added several key features that were initially planned for version 1.1.
  - **Extensive Testing:** The library has been thoroughly tested using Jest, ensuring stability and reliability.
  - **Complete Documentation:** The documentation has been substantially updated, with a few remaining sections still in progress.
  - **Refined API:** The overall API has been refined for better performance and usability, with clearer types and interfaces.
  - **Improved Code Quality:** Significant code improvements and optimizations have been made to ensure better maintainability and future extensibility.

  This release is intended for final testing before the full **1.0.0** release. While it is considered stable, please report any issues as we make the final refinements.

  ***

  ## About the Library

  This library allows developers to easily interact with the Marvel API in a type-safe way, providing methods for querying various endpoints (such as comics, characters, creators, and more). It supports both simple and complex queries and provides built-in functionality for handling pagination, filtering, and sorting.

  ### Why Re-release at 1.0.0?

  The previous releases (1.0.0 through 1.0.2) were prematurely published and lacked features, testing, and documentation. With this rewrite, the library is now truly production-ready, and this release candidate marks the beginning of the proper 1.0.0 series. This new version introduces several powerful features, including:

  - **Single Element Endpoints:** You can now write single-element endpoints like `"comics"` instead of needing to use `["comics"]`.
  - **More Configuration Options:** Many new configuration options allow you to customize the library to suit the specific needs of your project.
  - **AutoQuery Injection:** The big new feature in this release, AutoQuery, injects new methods and properties into the data returned by the API, making it easier to create new queries based on the result of a previous query.

  ### Example: AutoQuery Injection

  Here's an example of a function using AutoQuery:

  ```ts
  // We'll need Stan Lee's ID for the next query
  const stanLeeID = (
    await query("creators", {
      lastName: "Lee",
      firstName: "Stan",
    }).fetchSingle()
  ).id;
  // Now let's look up Peter Parker
  const peter = await query("characters", {
    name: "Peter Parker",
  }).fetchSingle();
  // And find all the comics from Stan Lee
  const leeParkerComics = await peter.comics
    .query({ creators: stanLeeID })
    .fetch();
  ```