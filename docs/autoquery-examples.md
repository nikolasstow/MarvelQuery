# AutoQuery Examples

Now that you’re familiar with the methods injected into the result data, let’s explore a few examples.

## Example 1: Doom

In this example, we’ll create a query for the character **Doctor Doom**, who, as of this writing, holds the title of Sorcerer Supreme in the Marvel Universe. Our goal is to fetch the most recent comics in which he has appeared.

If we already knew his character ID, we could directly query the endpoint for the collection of **Doctor Doom** comics. (e.g., `["characters", 1009281, "comics"]`, assuming `1009281` is his character ID). However, since we don’t have the ID for this example, we’ll first query the character by name:

```ts
const doom = await query("characters", {
  name: "Victor Von Doom",
}).fetchSingle();
```

Once we have **Doctor Doom’s** character data, we can access the [List](autoquery-blocks.md#list-properties) of comics via the comics property. This list contains up to 20 summaries of comics, presented in alphabetical order, from the collection of comics featuring Doom. Unfortunately, you cannot change how a [List](autoquery-blocks.md#list-properties) is sorted, but you can use the `query()` method to request the collection and sort the results by setting `orderBy` to `onsaleDate`, which represents the date when the comics went on sale.

```ts
const doomComics = await doom.comics
  .query({
    orderBy: "onsaleDate", // Sort comics by the On Sale Date
  })
  .fetch();
```



## Example 2: Chaining with `.then()`

In scenarios where you need to handle multiple asynchronous operations in sequence, .then() can provide a clean way to chain them together.

```ts
query("characters", {
  name: "Morlun",
})
  .fetchSingle()
  .then(({ comics }) => comics.query({ orderBy: "onsaleDate" }).fetchSingle())
  .then((mostRecentComic) => {
    // Once the most recent comic is fetched, we can process it
    console.log(mostRecentComic);
  });
```

In this example, we start by querying for the character Morlun, a Spider-Man villain. We’ve opted to use .then() and destructured the result to extract the comics list, where we then query the collection of Morlun comics for the most recent issues.

## Example 3: New This Month

**Step 1: Query for Comics**

In this example, we want to find new comic series that are launching this month. While the API doesn’t allow sorting **series** by start date (since series results only include start and end **years**), we can filter **comics** by more precise time periods. The `dateDescriptor` parameter works with relative time periods, meaning values like `thisMonth` are always relative to the current month, and next month the results will change accordingly. Additionally, we can use the `issueNumber` parameter to limit the results to first issues, helping us focus on new series.

```ts
const comics = await query("comics", {
  dateDescriptor: "thisMonth",
  issueNumber: 1,
}).fetch();
```

**Step 2: Fetch Series Details Sequentially**

After retrieving the list of comics, the next step is to gather details about the series each comic belongs to. While this requires a second query for each comic, we can take advantage of AutoQuery’s injected methods to make the process seamless. To avoid hitting API rate limits, we’ll fetch the series data one at a time.

```ts
const seriesDetails: Series[] = [];
for (const comic of comics.results) {
  const seriesDetail = await comic.series.fetchSingle(); 
  seriesDetails.push(seriesDetail);
}
```

For a comprehensive breakdown of how to fine-tune your queries, check out [**API Parameters**](api-parameters.md), where you’ll find detailed explanations of every available option. To better understand the structure of the data returned by the API, visit [**Data Types Explained**](data-types.md) for an in-depth guide to the formats and properties you’ll be working with.

[Next: **Parameters to Refine Your Query** →](api-parameters.md)