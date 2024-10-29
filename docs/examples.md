# Refining Queries with IDLists

In this section, we’ll explore how to refine queries using related resources from other data types. Each data type in the API offers parameters that let you filter your search by specifying different resources related to the results you’re looking for. These parameters correspond to the strings in the [EndpointType](endpoints.md#endpointtype) union and are available for all six main data types: `characters`, `comics`, `creators`, `events`, `series`, and `stories`. When querying one type, you typically see 4-5 parameters corresponding to the other types. For example, if you query for [`Creators`](api-parameters.md#creatorparams), you will have parameters named `comics`, `series`, `events`, and `stories` to refine the query based on those types. 

These parameters accept an [IDList](api-parameters#idlist), which can be a single ID (`number`) or an array of IDs (`number[]`). When you use this parameter type, the results are filtered to include only resources that are related to **all** the specified IDs. The filtered resource type corresponds to the parameter name (e.g., using the parameter with the key `"characters"` will filter the query to show only resources that feature **all** the characters listed in the value).

Let’s start with a simple example:

```ts
// We want to find comic series that Stan Lee and Jack Kirby worked on together.
// The endpoint determines what is the thing we are looking for (series)
query("series", { // The parameter key is the type we are filtering with (creators)
	creators:	[30, 196] // The value is the ID number or array of ID numbers of the creators
}).fetch();
```

There are some exceptions to this pattern. For example, parameters for querying [Comic](api-parameters.md#comicparams) resources include both a `"characters"` parameter and a `"sharedAppearances"` parameter, which serve similar purposes for filtering by character appearances. The `"collaborators"` parameter also works like `"creators"` allowing you to filter by multiple creator IDs.

Now that we’ve covered the basics let’s apply this to a more complex scenario: finding comics that feature both **Spider-Man** and the **Hulk**:

```ts
// First, we need to unmask these vigilantes and identify them
// We want to query the entire "characters" endpoint
const spidey = await query("characters", {
  name: "Peter Parker", // And input the name of that bugle photographer who takes pictures of that masked menace.
})
  .fetchSingle() // returns Promise<Character>
  .then((character) => character.id); // But all we need is the ID

// Follow the same steps for the Gamma Genius
const banner = await query("characters", {
  name: "Bruce Banner",
})
  .fetchSingle()
  .then((character) => character.id);

// Finally, we can use the IDs in an array with the 'sharedAppearances' parameter
const comics = await query("comics", {
  sharedAppearances: [spidey, banner],
}).fetch(); // Returns Promise<Comic[]> with comics featuring both Hulk and Spider-Man
```

Now, let’s take things a step further and create a reusable function that simplifies this process. By providing character names as arguments, it uses a helper function to retrieve each character’s ID by querying the `"characters" `endpoint.  The API calls are made sequentially to avoid overwhelming the system. Once both IDs are collected, the function queries the "comics" endpoint with the `"sharedAppearances`" parameter, ensuring that only comics featuring both characters are returned. 

```ts
async function findCrossoverComics(character1: string, character2: string) {
  // Helper function to fetch a character ID by name
  const fetchCharacterId = async (name: string) =>
    query("characters", { name }).fetchSingle().then((character) => character.id);

  // Query for comics featuring both characters by fetching IDs directly in the array
  return query("comics", {
    sharedAppearances: [
      await fetchCharacterId(character1),
      await fetchCharacterId(character2),
    ],
  }).fetch();
}

// Example usage:
const crossoverComics = await findCrossoverComics("Valeria Richards", "Agatha Harkness");
```

[← Back](endpoints.md) | [Table of Contents](table-of-contents.md) | [Next: **Building Blocks & AutoQuery →**](autoquery-blocks.md)
