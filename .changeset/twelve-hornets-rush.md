---
"marvelquery": patch
---

- axios is now a peer dependency so it must be installed separately or replaced with a substitute http client.
- Formats are now validated regardless of case.
- Removed Parameters type because it's redundant and there are no required parameters for any query.
- Fixed ParamsType so now there are no accepted parameters for endpoints that direct to a single item.
