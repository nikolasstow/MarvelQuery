# marvelquery

## 1.0.1

### Patch Changes

- ca72518: added .npmrc and release script

## 1.0.0

### Major Changes

- 076bdba: - Added documentation inside classes, types, and .describe() for Zod schemas.
  - Removed search functions as they are incomplete and won’t be ready for the first release.
  - Removed redundant code to improve codebase clarity.
  - Improved validation for endpoints, ensuring better data integrity.
  - Fixed bugs in Zod schemas for more accurate validation.
  - Renamed api-interfaces.ts to utility-types.ts to better reflect the module’s purpose and content.
  - Removed samples.ts, all examples are available in examples.ts
  - Added an optional onResult function to run on the result of any type, unless a specific onResult function for that type is provided. This allows for generalized processing of query results.
  - Lowered the default limit to 50 and fixed Zod schemas for event’s start and end dates, addressing inconsistencies in Marvel’s date formats.

### Minor Changes

- 9d6d75b: test. Don't judge me.
- bf50353: Bug fixes, clean up, preparing for launch. Reorganized types, watched some Matt Pocock videos, the usual.
