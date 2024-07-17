import { z } from 'zod';
import { EndpointType } from './api-interface';
import {
  APISchema,
  CharactersSchema,
  ComicsSchema,
  CreatorsSchema,
  DateDescriptorSchema,
  EventsSchema,
  SeriesSchema,
  StoriesSchema,
} from '../schemas/param-schemas';

/** Base parameters for all queries
 * @property modifiedSince - Only return objects created or changed since the specified date. (format: YYYY-MM-DD)
 * @property limit - Limit the result set to the specified number of resources.
 * @property offset - Skip the specified number of resources in the result set.
 */
export type APIBase = z.infer<typeof APISchema>;
/** Parameters for the 'characters' endpoint
 * @property name - Return only characters matching the specified full character name (e.g. Spider-Man).
 * @property nameStartsWith - Return characters with names that begin with the specified string (e.g. Sp).
 * @property modifiedSince - Only return characters created or changed since the specified date. (format: YYYY-MM-DD)
 * @property comics - Return only characters which appear in the specified comics (accepts a comma-separated list of ids).
 * @property series - Return only characters which appear the specified series (accepts a comma-separated list of ids).
 * @property events - Return only characters which appear the specified events (accepts a comma-separated list of ids).
 * @property stories - Return only characters which appear the specified stories (accepts a comma-separated list of ids).
 * @property orderBy - Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.
 * @options ```name, modified, -name, -modified```
 * 
 * @property modifiedSince - Only return characters created or changed since the specified date. (format: YYYY-MM-DD)
 * @property limit - Limit the result set to the specified number of resources.
 * @property offset - Skip the specified number of resources in the result set.
 */
export type Characters = z.infer<typeof CharactersSchema>;
/** Parameters for the 'comics' endpoint
 * @property format - Filter by the issue format.
 * @options ```comic, magazine, trade paperback, hardcover, digest, graphic novel, digital comic, infinite comic```
 * @property formatType - Filter by the issue format type (comic or collection).
 * @options ```comic, collection```
 * @property { boolean } noVariants - Exclude variants (alternate covers, secondary printings, director's cuts, etc.) from the result set.
 * @property dateDescriptor - Return comics within a predefined date range.
 * @options ```lastWeek, thisWeek, nextWeek, thisMonth```
 * @property dateRange - Return comics within a predefined date range. Dates must be specified as date1,date2 (e.g. 2013-01-01,2013-01-02). Dates are preferably formatted as YYYY-MM-DD but may be sent as any common date format.
 * @property title - Return only issues in series whose title matches the input.
 * @property titleStartsWith - Return only issues in series whose title starts with the input.
 * @property startYear - Return only issues in series whose start year matches the input.
 * @property issueNumber - Return only issues in series whose issue number matches the input.
 * @property diamondCode - Filter by diamond code.
 * @property digitalId - Filter by digital comic id.
 * @property upc - Filter by UPC.
 * @property isbn - Filter by ISBN.
 * @property ean - Filter by EAN.
 * @property issn - Filter by ISSN.
 * @property { boolean } hasDigitalIssue - Filter by having digital rights.
 * @property creators - Return only issues containing the specified creators (accepts a comma-separated list of ids).
 * @property series - Return only issues in the specified series (accepts a comma-separated list of ids).
 * @property events - Return only issues in the specified events (accepts a comma-separated list of ids).
 * @property stories - Return only issues in the specified stories (accepts a comma-separated list of ids).
 * @property sharedAppearances - Return only issues in which the specified characters appear together (for example in which both Spider-Man and Gamora appear). Accepts a comma-separated list of ids.
 * @property collaborators - Return only issues in which the specified creators worked together (for example in which both Brian Bendis and Stan Lee did work). Accepts a comma-separated list of ids.
 * @property orderBy - Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.
 * @options ```focDate, onsaleDate, title, issueNumber, modified, -focDate, -onsaleDate, -title, -issueNumber, -modified```
 * @property limit - Limit the result set to the specified number of resources.
 * @property offset - Skip the specified number of resources in the result set.
 */
export type Comics = z.infer<typeof ComicsSchema>;
export type Creators = z.infer<typeof CreatorsSchema>;
export type Events = z.infer<typeof EventsSchema>;
export type Series = z.infer<typeof SeriesSchema>;
export type Stories = z.infer<typeof StoriesSchema>;

export type DateDescriptor = z.infer<typeof DateDescriptorSchema>;