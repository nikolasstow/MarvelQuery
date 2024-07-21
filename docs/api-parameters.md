# Query Parameters

## Character

| Property         | Type       | Description                                                                                         |
|------------------|------------|-----------------------------------------------------------------------------------------------------|
| `name`           | `string` | Return only characters matching the specified full character name (e.g. Spider-Man).                 |
| `nameStartsWith` | `string` | Return only characters with names that begin with the specified string (e.g. Sp).                         |
| `comics`         | `string`, `string` | Return only characters which appear in the specified comics (accepts a comma-separated list of ids).  |
| `series`         | `string`, `string` | Return only characters which appear in the specified series (accepts a comma-separated list of ids).  |
| `events`         | `string`, `string` | Return only characters which appear in the specified events (accepts a comma-separated list of ids).  |
| `stories`        | `string`, `string` | Return only characters which appear in the specified stories (accepts a comma-separated list of ids). |
| `orderBy`        | `string[]` | Order the result set by a field or fields. Add a "-" to the value to sort in descending order. Multiple values are given priority in the order in which they are