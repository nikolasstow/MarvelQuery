# Code Examples

Referance api-parameters.md and data-types.md

```ts
// Do's and Don'ts

const comics = await query("comics", {
  dateDescriptor: "thisWeek"
}).fetch();

// Show common queries, like finding comics that feature both Spider-Man and Doc Ock


```

## Why no fetchAll() feature?

I chose to exclude a fetchAll function from this library because using it on the wrong query can very quickly

```ts
while(!query.isComplete) {
  query.fetch();
}
```

[← Back](endpoints.md) | [Table of Contents](table-of-contents.md) | [Next: **Building Blocks & AutoQuery →**](autoquery-blocks.md)
