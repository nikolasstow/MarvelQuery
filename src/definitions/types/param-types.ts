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
 * @example ```'name'``` or ```'-name, -modified'```
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
 * @example ```'focDate'``` or ```'-focDate, -modified'```
 * @options ```focDate, onsaleDate, title, issueNumber, modified, -focDate, -onsaleDate, -title, -issueNumber, -modified```
 * @property limit - Limit the result set to the specified number of resources.
 * @property offset - Skip the specified number of resources in the result set.
 */
export type Comics = z.infer<typeof ComicsSchema>;
/**
 * @property firstName - Filter by creator first name (e.g. Brian).
 * @property middleName - Filter by creator middle name (e.g. Michael).
 * @property lastName - Filter by creator last name (e.g. Bendis).
 * @property suffix - Filter by suffix or honorific (e.g. Jr., Sr.).
 * @property nameStartsWith - Filter by creator names that match critera (e.g. B, St L).
 * @property firstNameStartsWith - Filter by creator first names that match critera (e.g. B, St L).
 * @property middleNameStartsWith - Filter by creator middle names that match critera (e.g. Mi).
 * @property lastNameStartsWith - Filter by creator last names that match critera (e.g. Ben).
 * @property modifiedSince - Return only creators which have been modified since the specified date.
 * @property comics - Return only creators who worked on in the specified comics (accepts a comma-separated list of ids).
 * @property series - Return only creators who worked on the specified series (accepts a comma-separated list of ids).
 * @property events - Return only creators who worked on comics that took place in the specified events (accepts a comma-separated list of ids).
 * @property stories - Return only creators who worked on the specified stories (accepts a comma-separated list of ids).
 * @property orderBy - Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.
 * @example ```'lastName'``` or ```'-lastName, -firstName'```
 * @options ```lastName, firstName, middleName, suffix, modified, -lastName, -firstName, -middleName, -suffix, -modified```
 * @property limit - Limit the result set to the specified number of resources.
 * @property offset - Skip the specified number of resources in the result set.
 */
export type Creators = z.infer<typeof CreatorsSchema>;
/**
 * @property name - Return only events which match the specified name.
 * @property nameStartsWith - Return only events which match the specified name.
 * @property modifiedSince - Return only events which have been modified since the specified date.
 * @property creators - Return only events which feature work by the specified creators (accepts a comma-separated list of ids).
 * @property characters - Return only events which feature the specified characters (accepts a comma-separated list of ids).
 * @property series - Return only events which are part of the specified series (accepts a comma-separated list of ids).
 * @property comics - Return only events which take place in the specified comics (accepts a comma-separated list of ids).
 * @property stories - Return only events which take place in the specified stories (accepts a comma-separated list of ids).
 * @property orderBy - Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.
 * @example ```'name'``` or ```'-name, -startDate'```
 * @options ```name, startDate, modified, -name, -startDate, -modified```
 * @property limit - Limit the result set to the specified number of resources.   
 * @property offset - Skip the specified number of resources in the result set.
 */
export type Events = z.infer<typeof EventsSchema>;
/**
 * @property title - Return only series which match the specified title.
 * @property titleStartsWith - Return series with titles that begin with the specified string (e.g. Sp).
 * @property startYear - Return only series matching the specified start year.
 * @property modifiedSince - Return only series which have been modified since the specified date.
 * @property comics - Return only series which contain the specified comics (accepts a comma-separated list of ids).
 * @property stories - Return only series which contain the specified stories (accepts a comma-separated list of ids). 
 * @property events - Return only series which have comics that take place during the specified events (accepts a comma-separated list of ids).
 * @property creators - Return only series which feature work by the specified creators (accepts a comma-separated list of ids).
 * @property characters - Return only series which feature the specified characters (accepts a comma-separated list of ids).
 * @property seriesType - Filter the series by publication frequency type.
 * @options ```collection, one shot, limited, ongoing```
 * @property contains - Return only series containing one or more comics with the specified format.
 * @example ```'comic'``` or ```'magazine, hardcover'```
 * @options ```comic, magazine, trade paperback, hardcover, digest, graphic novel```
 * @property orderBy - Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.
 * @example ```'startYear'``` or ```'-startYear, title'```
 * @options ```title, modified, startYear, -title, -modified, -startYear```
 * @property limit - Limit the result set to the specified number of resources.
 * @property offset - Skip the specified number of resources in the result set.
 */
export type Series = z.infer<typeof SeriesSchema>;
/**
 * @property modifiedSince - Return only stories which have been modified since the specified date.
 * @property comics - Return only stories contained in the specified (accepts a comma-separated list of ids).
 * @property series - Return only stories contained the specified series (accepts a comma-separated list of ids).
 * @property events - Return only stories which take place during the specified events (accepts a comma-separated list of ids).
 * @property creators - Return only stories which feature work by the specified creators (accepts a comma-separated list of ids).	
 * @property characters - Return only stories which feature the specified characters (accepts a comma-separated list of ids).
 * @property orderBy - Order the result set by a field or fields. Add a "-" to the value sort in descending order. Multiple values are given priority in the order in which they are passed.
 * @example ```'modified'``` or ```'-modified, title'```
 * @options ```id, modified, -id, -modified```
 * @property limit - Limit the result set to the specified number of resources.
 * @property offset - Skip the specified number of resources in the result set.
 */
export type Stories = z.infer<typeof StoriesSchema>;
/** Return comics within a predefined date range.
 * @options ```lastWeek, thisWeek, nextWeek, thisMonth```
 */
export type DateDescriptor = z.infer<typeof DateDescriptorSchema>;