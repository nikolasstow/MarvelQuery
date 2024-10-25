# More Code Examples

## Example 1: Crossovers

In this example, we’re searching for comic issues that feature both Spider-Man and the Hulk. Each data type in the API offers parameters that allow you to refine your query by specifying items of a different type that are related to the results you’re searching for. These parameters share names with the strings in the [`EndpointType`](endpoints.md#endpointtype) union and are available for all six main data types (`characters`, `comics`, `creators`, `events`, `series`, and `stories`). When querying one type, you will typically see 4-5 parameters corresponding to the other types. For example, if you query the `"creators"` endpoint, you will have parameters like `comics`, `series`, `events`, and `stories` to refine the query based on those types. 

These parameters accept an [IDList](api-parameters#idlist), which can be a single ID (`number`) or an array of IDs (`number[]`). When you use this type of parameter, it filters the results to include only items that are related to **all** the specified IDs. The type of items being filtered corresponds to the parameter name (e.g., using the parameter with the key `"characters"` will filter the query to show only items that feature **all** the characters listed in the value). Let's look at a simpler example first:

```ts
// We want to find comic series than Stan Lee and Jack Kirby worked on together
// The endpoint determines what is the thing we are looking for (series)
query("series", { // The parameter key is the type we are filtering with (creators)
	creators:	[30, 196] // The value is the id number, or array of id numbers of the creators
}).fetch();
```

There are some exceptions to this pattern. For example, the comics endpoint includes both a "characters" parameter and a "sharedAppearances" parameter, which serve similar purposes for filtering by character appearances. Additionally, there’s a "collaborators" parameter, which works like "creators", allowing you to filter by multiple creator IDs.

Now that you understand the basics, let’s move on to our main example: finding comics that feature both Spider-Man and the Hulk:

```ts
// First we need to unmask these vigilantes and identify them
// We want to query the entire "characters" endpoint
const spidey = await query("characters", {
  name: "Peter Parker", // And input the name of that bugle photographer who takes pictures of that masked menace
})
  .fetchSingle() // returns Promise<Character>
  .then((character) => character.id); // But all we need is the id

// Follow the same steps for the Gamma Genius
const banner = await query("characters", {
  name: "Bruce Banner",
})
  .fetchSingle()
  .then((character) => character.id);

// Now finally we can make our query now that we have the ids
const comics = await query("comics", {
  sharedAppearances: [spidey, banner],
}).fetch(); // Returns Promise<Comic[]> with comics feature both Hulk and Spider-Man
```

[← Back](endpoints.md) | [Table of Contents](table-of-contents.md) | [Next: **Building Blocks & AutoQuery →**](autoquery-blocks.md)
