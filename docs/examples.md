# Code Examples

```ts
// Do's and Don'ts

const comics = await query("comics", {
  dateDescriptor: "thisWeek"
}).fetch();

for (comic)
```

## Why no fetchAll() feature?

I chose to exclude a fetchAll function from this library because using it on the wrong query can very quickly

```ts
while(!query.isComplete) {
  query.fetch();
}
```

## AutoQuery Injection

## Chained Resource Querying
