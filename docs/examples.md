# More Code Examples

## Example 1: Crossovers

```ts
// Find comics that feature Spider-Man and Dock Ock
const spidey = await query("characters", {
  name: "Peter Parker",
})
  .fetchSingle()
  .then((character) => character.id);

const ock = await query("characters", {
  name: "Doctor Octopus",
})
  .fetchSingle()
  .then((character) => character.id);

const comics = await query("comics", {
  characters: [spidey, ock],
}).fetch();
```

← Back](endpoints.md) | [Table of Contents](table-of-contents.md) | [Next: **Building Blocks & AutoQuery →**](autoquery-blocks.md)
