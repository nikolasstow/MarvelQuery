---
"marvelquery": minor
---

- Second argument of query (params) is no longer required and defaults to an empty object. This is for requesting an item by id so you no longer need to pass an empty object.
- Fixed a few bugs in ParamsType and made it more readable.
- Merged MarvelResult and MarvelResultQuery
- Reverted case insensitivity on Formats because it break IDE suggestions. Instead added capitalized (first letter of a word) versions of each format to the Format array.
