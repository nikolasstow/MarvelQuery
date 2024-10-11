import { z } from "zod";
import {
  TextObjectSchema,
  URLSchema,
  ImageSchema,
  ComicDateSchema,
  ComicPriceSchema,
  SummarySchema,
  RoleSummarySchema,
  TypeSummarySchema,
  ListSchema,
  ComicListSchema,
  StoryListSchema,
  SeriesListSchema,
  EventListSchema,
  CreatorListSchema,
  CharacterListSchema,
  MarvelResultSchema,
  MarvelComicSchema,
  MarvelEventSchema,
  MarvelSeriesSchema,
  MarvelCreatorSchema,
  MarvelCharacterSchema,
  MarvelStorySchema,
} from "../schemas/data-schemas";
import {
  Endpoint,
  EndpointFromType,
  EndpointType,
  ExcludeEndpointType,
  NewEndpoint,
} from "./endpoint-types";
import { ExtendResult } from "./autoquery-types";

/** Result data type as an EndpointType, determined by the endpoint <E> */
export type DataType<E> = E extends Endpoint
  ? E[2] extends EndpointType // If there is a 3rd element (and is an EndpointType) use it
    ? E[2]
    : E[0] extends EndpointType // Otherwise use the first element (if it is an EndpointType)
    ? E[0]
    : ["Error, could not determine data type", E]
  : ["Error, not a valid endpoint", E];

/** The data type of the result, determined by the endpoint <E> */
export type APIResult<E extends Endpoint> = ResultMap[DataType<E>];

/** A map of the EndpointTypes to the corresponding result types */
export type ResultMap = {
  comics: MarvelComic;
  characters: MarvelCharacter;
  creators: MarvelCreator;
  events: MarvelEvent;
  stories: MarvelStory;
  series: MarvelSeries;
};

/** The return type of the endpoint after AutoQuery Injection */
type ReturnType<T extends EndpointType> =
  | ExtendResult<EndpointFromType<T>> // [T]
  | ExtendResult<NewEndpoint<EndpointFromType<ExcludeEndpointType<T>>, T>>;

/**| Property             | Type                                              | Description                                                  
 * | -------------------- | ------------------------------------------------- | ------------------------------------------------------------ 
 * | **`endpoint`**       | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). 
 * | **`query()`**        | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the comic.                    
 * | **`fetch()`**        | [`Promise<MarvelQuery>`](marvel-query.md)         | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. 
 * | **`fetchSingle()`**  | [`Promise<Comic>`](#marvelcomic)                  | Fetches and returns the resource.                            
 * | `id`                 | `number`                                          | The unique ID of the comic resource.                         
 * | `resourceURI`        | `string`                                          | The canonical URL identifier for this resource.              
 * | `modified`           | `string`                                          | The date the resource was most recently modified.            
 * | `urls`               | [`URL[]`](data-types.md/#url)                     | A set of public web site URLs for the resource.              
 * | `thumbnail`          | [`Image`](data-types.md/#image)                   | The representative image for this comic.                     
 * | `digitalId`          | `number`                                          | The ID of the digital comic representation of this comic. Will be 0 if the comic is not available digitally. 
 * | `title`              | `string`                                          | The canonical title of the comic.                            
 * | `issueNumber`        | `number`                                          | The number of the issue in the series (will generally be 0 for collection formats). 
 * | `variantDescription` | `string`                                          | If the issue is a variant (e.g. an alternate cover, second printing, or director’s cut), a text description of the variant. 
 * | `description`        | `string`                                          | The preferred description of the comic.                      
 * | `isbn`               | `string`                                          | The ISBN for the comic (generally only populated for collection formats). 
 * | `upc`                | `string`                                          | The UPC barcode number for the comic (generally only populated for periodical formats). 
 * | `diamondCode`        | `string`                                          | The Diamond code for the comic.                              
 * | `ean`                | `string`                                          | The EAN barcode for the comic.                               
 * | `issn`               | `string`                                          | The ISSN barcode for the comic.                              
 * | `format`             | [`Format`](api-parameters.md/#format)             | The format of the comic e.g. comic, digital comic, hardcover, trade paperback. 
 * | `pageCount`          | `number`                                          | The number of pages in the comic.                            
 * | `textObjects`        | [`TextObject[]`](data-types.md/#textobject)       | A set of descriptive text blurbs for the comic.              
 * | `series`             | [`SeriesSummary[]`](data-types.md/#seriessummary) | A summary representation of the series to which this comic belongs. 
 * | `variants`           | [`ComicSummary[]`](data-types.md#comicsummary)    | A list of variant issues for this comic (includes the "original" issue if the current issue is a variant). 
 * | `collections`        | [`ComicSummary[]`](data-types.md#comicsummary)    | A list of collections which include this comic (will generally be empty if the comic's format is a collection). 
 * | `collectedIssues`    | [`ComicSummary[]`](data-types.md#comicsummary)    | A list of issues collected in this comic (will generally be empty for periodical formats such as "comic" or "magazine" 
 * | `dates`              | [`ComicDate[]`](data-types.md#comicdate)          | A list of key dates for this comic.                          
 * | `prices`             | [`ComicPrice[]`](data-types.md#comicprice)        | A list of prices for this comic.                             
 * | `images`             | [`Image[]`](data-types.md#image`)                 | A list of promotional images associated with this comic.     
 * | `creators`           | [`CreatorList`](data-types.md#creatorlist)        | A resource list containing the creators associated with this comic. 
 * | `characters`         | [`CharacterList`](data-types.md#characterlist)    | A resource list containing the characters in this comic.     
 * | `stories`            | [`StoryList`](data-types.md#storylist)            | A resource list containing the stories which appear in this comic. 
 * | `events`             | [`EventList`](data-types.md#eventlist)            | A resource list containing the events in which this comic appears. 
 */
export type Comic = ReturnType<"comics">;

/**| Property            | Type                                              | Description                                                  
 * | ------------------- | ------------------------------------------------- | ------------------------------------------------------------ 
 * | **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). 
 * | **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the comic.                    
 * | **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)         | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. 
 * | **`fetchSingle()`** | [`Promise<Comic>`](#marvelcomic)                  | Fetches and returns the resource.                            
 * | `id`                | `number`                                          | The unique ID of the event resource.                         
 * | `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              
 * | `modified`          | `string`                                          | The date the resource was most recently modified.            
 * | `urls`              | [`URL[]`](data-types.md#url)                      | A set of public web site URLs for the resource.              
 * | `thumbnail`         | [`Image`](data-types.md#image)                    | The representative image for this event.                     
 * | `title`             | `string`                                          | The title of the event.                                      
 * | `description`       | `string`                                          | A description of the event.                                  
 * | `start`             | `YYYY-MM-DD HH:MM:SS`                             | The date of publication of the first issue in this event     
 * | `end`               | `YYYY-MM-DD HH:MM:SS`                             | The date of publication of the last issue in this event      
 * | `comics`            | [`ComicList`](data-types.md#comiclist)            | A resource list containing the comics in this event.         
 * | `stories`           | [`StoryList`](data-types.md#storylist)            | A resource list containing the stories in this event.        
 * | `series`            | [`SeriesList`](data-types.md#serieslist)          | A resource list containing the series in this event.         
 * | `characters`        | [`CharacterList`](data-types.md#characterlist)    | A resource list containing the characters which appear in this event. 
 * | `creators`          | [`CreatorList`](data-types.md#creatorlist)        | A resource list containing creators whose work appears in this event. 
 * | `next`              | [`EventSummary[]`](data-types.md#eventsummary)    | A summary representation of the event which follows this event in the timeline. 
 * | `previous`          | [`EventSummary[]`](data-types.md#eventsummary)    | A summary representation of the event which preceded this event in the timeline. 
 */
export type Event = ReturnType<"events">;

/**| Property            | Type                                              | Description                                                  
 * | ------------------- | ------------------------------------------------- | ------------------------------------------------------------ 
 * | **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). 
 * | **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the comic.                    
 * | **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)         | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. 
 * | **`fetchSingle()`** | [`Promise<Comic>`](#marvelcomic)                  | Fetches and returns the resource.                            
 * | `id`                | `number`                                          | The unique ID of the series resource.                        
 * | `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              
 * | `modified`          | `string`                                          | The date the resource was most recently modified.            
 * | `urls`              | [`URL[]`](data-types.md#url)                      | A set of public web site URLs for the resource.              
 * | `thumbnail`         | [`Image`](data-types.md#image)                    | The representative image for this series.                    
 * | `title`             | `string`                                          | The canonical title of the series.                           
 * | `description`       | `string`                                          | A description of the series.                                 
 * | `startYear`         | `number`                                          | The first year in which the series has been published.       
 * | `endYear`           | `number`                                          | The last year of publication for the series (conventionally, 2099 for ongoing series). 
 * | `rating`            | `string`                                          | The age-appropriateness rating for the series.               
 * | `comics`            | [`ComicList`](data-types.md#comiclist)            | A resource list containing comics in this series.            
 * | `stories`           | [`StoryList`](data-types.md#storylist)            | A resource list containing stories which occur in comics in this series. 
 * | `events`            | [`EventList`](data-types.md#eventlist)            | A resource list containing events which take place in comics in this series. 
 * | `characters`        | [`CharacterList`](data-types.md#characterlist)    | A resource list containing the characters which appear in this series. 
 * | `creators`          | [`CreatorList`](data-types.md#creatorlist)        | A resource list containing creators whose work appears in this series. 
 * | `next`              | [`SeriesSummary`](data-types.md#seriessummary)    | A summary representation of the series which follows this series in the timeline. 
 * | `previous`          | [`SeriesSummary`](data-types.md#seriessummary)    | A summary representation of the series which preceded this series in the timeline. 
 */
export type Series = ReturnType<"series">;

/**| Property            | Type                                              | Description                                                  
 * | ------------------- | ------------------------------------------------- | ------------------------------------------------------------ 
 * | **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). 
 * | **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the comic.                    
 * | **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)         | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. 
 * | **`fetchSingle()`** | [`Promise<Comic>`](#marvelcomic)                  | Fetches and returns the resource.                            
 * | `id`                | `number`                                          | The unique ID of the creator resource.                       
 * | `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              
 * | `modified`          | `string`                                          | The date the resource was most recently modified.            
 * | `urls`              | [`URL[]`](data-types.md#url)                      | A set of public web site URLs for the resource.              
 * | `thumbnail`         | [`Image`](data-types.md#image)                    | The representative image for this creator.                   
 * | `firstName`         | `string`                                          | The first name of the creator.                               
 * | `middleName`        | `string`                                          | The middle name of the creator.                              
 * | `lastName`          | `string`                                          | The last name of the creator.                                
 * | `suffix`            | `string`                                          | The suffix or honorific for the creator.                     
 * | `fullName`          | `string`                                          | The full name of the creator (a space-separated concatenation of the above four fields). 
 * | `series`            | [`SeriesList`](data-types.md#serieslist)          | A resource list containing the series which feature work by this creator. 
 * | `stories`           | [`StoryList`](data-types.md#storylist)            | A resource list containing the stories which feature work by this creator. 
 * | `comics`            | [`ComicList`](data-types.md#comiclist)            | A resource list containing the comics which feature work by this creator. 
 * | `events`            | [`EventList`](data-types.md#eventlist)            | A resource list containing the events which feature work by this creator. 
 */
export type Creator = ReturnType<"creators">;

/**| Property            | Type                                              | Description                                                  
 * | ------------------- | ------------------------------------------------- | ------------------------------------------------------------ 
 * | **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). 
 * | **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the comic.                    
 * | **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)         | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. 
 * | **`fetchSingle()`** | [`Promise<Comic>`](#marvelcomic)                  | Fetches and returns the resource.                            
 * | `id`                | `number`                                          | The unique ID of the character resource.                     
 * | `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              
 * | `modified`          | `string`                                          | The date the resource was most recently modified.            
 * | `urls`              | [`URL[]`](data-types.md#url)                      | A set of public web site URLs for the resource.              
 * | `thumbnail`         | [`Image`](data-types.md#image)                    | The representative image for this character.                 
 * | `name`              | `string`                                          | The name of the character.                                   
 * | `description`       | `string`                                          | A short bio or description of the character.                 
 * | `comics`            | [`ComicList`](data-types.md#comiclist)            | A resource list containing comics which feature this character. 
 * | `stories`           | [`StoryList`](data-types.md#storylist)            | A resource list containing the stories in which this character appears. 
 * | `events`            | [`EventList`](data-types.md#eventlist)            | A resource list containing the events in which this character appears. 
 * | `series`            | [`SeriesList`](data-types.md#serieslist)          | A resource list containing the series in which this character appears. 
 */
export type Character = ReturnType<"characters">;

/**| Property            | Type                                              | Description                                                  
 * | ------------------- | ------------------------------------------------- | ------------------------------------------------------------ 
 * | **`endpoint`**      | [`Endpoint`](utility-types.md#endpoints)          | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). 
 * | **`query()`**       | [`QueryResource`](marvel-query.md#query-resource) | Query a collection relating to the comic.                    
 * | **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)         | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. 
 * | **`fetchSingle()`** | [`Promise<Comic>`](#marvelcomic)                  | Fetches and returns the resource.                            
 * | `id`                | `number`                                          | The unique ID of the story resource.                         
 * | `resourceURI`       | `string`                                          | The canonical URL identifier for this resource.              
 * | `modified`          | `string`                                          | The date the resource was most recently modified.            
 * | `urls`              | [`URL[]`](data-types.md#url)                      | A set of public web site URLs for the resource.              
 * | `thumbnail`         | [`Image`](data-types.md#image)                    | The representative image for this story.                     
 * | `title`             | `string`                                          | The story title.                                             
 * | `description`       | `string`                                          | A description of the story.                                  
 * | `type`              | `string`                                          | The story type e.g. interior story, cover, text story.       
 * | `comics`            | [`ComicList`](data-types.md#comiclist)            | A resource list containing comics in which this story takes place. 
 * | `series`            | [`SeriesList`](data-types.md#serieslist)          | A resource list containing series in which this story appears. 
 * | `events`            | [`EventList`](data-types.md#eventlist)            | A resource list containing events in which this story appears. 
 * | `characters`        | [`CharacterList`](data-types.md#characterlist)    | A resource list containing the characters which appear in this story. 
 * | `creators`          | [`CreatorList`](data-types.md#creatorlist)        | A resource list of creators who worked on this story.        
 * | `originalIssue`     | [`ComicSummary`](data-types.md#comicsummary)      | A summary representation of the issue in which this story was originally published. 
 */
export type Story = ReturnType<"stories">;

/**| Property   | Type     | Description
 * | ---------- | -------- | ------------------------------------------------------------
 * | `type`     | `string` | Only return resources created or changed since the specified date.
 * | `language` | `string` | The IETF language tag denoting the language the text object is written in.
 * | `text`     | `string` | The text.
 */
export type TextObject = z.infer<typeof TextObjectSchema>;

/**| Property | Type     | Description                                      
 * | -------- | -------- | ------------------------------------------------ 
 * | `type`   | `string` | A text identifier for the URL.                   
 * | `url`    | `string` | A full URL (including scheme, domain, and path). 
 */
export type URL = z.infer<typeof URLSchema>;

/**| Property    | Type     | Description                                      
 * | ----------- | -------- | ------------------------------------------------ 
 * | `path`      | `string` | The directory path of the image.                 
 * | `extension` | `string` | A full URL (including scheme, domain, and path). 
 */
export type Image = z.infer<typeof ImageSchema>;

/**| Property | Type     | Description
 * | -------- | -------- | ------------------------------------------------------------ 
 * | `type`   | `string` | A description of the price (e.g. print price, digital price).
 * | `price`  | `number` | The price (all prices in USD).
 */
export type ComicDate = z.infer<typeof ComicDateSchema>;

/**| Property | Type     | Description
 * | -------- | -------- | ------------------------------------------------------------
 * | `type`   | `string` | A description of the price (e.g. print price, digital price).
 * | `price`  | `number` | The price (all prices in USD).
 */
export type ComicPrice = z.infer<typeof ComicPriceSchema>;

/**| Property      | Type     | Description                          
 * | ------------- | -------- | ------------------------------------ 
 * | `resourceURI` | `string` | The path to the individual resource. 
 * | `name`        | `string` | The canonical name of the resource.  
 */
export type Resource = z.infer<typeof SummarySchema>;

/**| Property      | Type     | Description                                  
 * | ------------- | -------- | -------------------------------------------- 
 * | `resourceURI` | `string` | The path to the individual resource.         
 * | `name`        | `string` | The canonical name of the resource.          
 * | `role`        | `string` | The role of the person in the parent entity. 
 */
export type RoleSummary = z.infer<typeof RoleSummarySchema>;

/**| Property      | Type     | Description                          
 * | ------------- | -------- | ------------------------------------ 
 * | `resourceURI` | `string` | The path to the individual resource. 
 * | `name`        | `string` | The canonical name of the resource.  
 * | `type`        | `string` | The type of the entity.              
 */
export type TypeSummary = z.infer<typeof TypeSummarySchema>;

/**| Property      | Type     | Description                                
 * | ------------- | -------- | ------------------------------------------ 
 * | `resourceURI` | `string` | The path to the individual comic resource. 
 * | `name`        | `string` | The canonical name of the comic.           
 */
export type ComicSummary = z.infer<typeof SummarySchema>;

/**| Property      | Type     | Description                                
 * | ------------- | -------- | ------------------------------------------ 
 * | `resourceURI` | `string` | The path to the individual resource.       
 * | `name`        | `string` | The canonical name of the story.           
 * | `role`        | `string` | The type of the story (interior or cover). 
 */
export type StorySummary = z.infer<typeof RoleSummarySchema>;

/**| Property      | Type     | Description                                 
 * | ------------- | -------- | ------------------------------------------- 
 * | `resourceURI` | `string` | The path to the individual series resource. 
 * | `name`        | `string` | The canonical name of the series.           
 */
export type SeriesSummary = z.infer<typeof SummarySchema>;

/**| Property      | Type     | Description                                   
 * | ------------- | -------- | --------------------------------------------- 
 * | `resourceURI` | `string` | The path to the individual resource.          
 * | `name`        | `string` | The full name of the creator.                 
 * | `role`        | `string` | The role of the creator in the parent entity. 
 */
export type CreatorSummary = z.infer<typeof RoleSummarySchema>;

/**| Property      | Type     | Description                                     
 * | ------------- | -------- | ----------------------------------------------- 
 * | `resourceURI` | `string` | The path to the individual resource.            
 * | `name`        | `string` | The full name of the character.                 
 * | `role`        | `string` | The role of the character in the parent entity. 
 */
export type CharacterSummary = z.infer<typeof RoleSummarySchema>;

/**| Property      | Type     | Description                                
 * | ------------- | -------- | ------------------------------------------ 
 * | `resourceURI` | `string` | The path to the individual event resource. 
 * | `name`        | `string` | The name of the event.                     
 */
export type EventSummary = z.infer<typeof SummarySchema>;

/**| Property        | Type                               | Description
 * | --------------- | ---------------------------------- | ------------------------------------------------------------
 * | `available`     | `number`                           | The number of total available resources in this list. Will always be greater than or equal to the "returned" value.
 * | `returned`      | `number`                           | The number of resources returned in this collection (up to 20).
 * | `collectionURI` | `string`                           | The path to the full list of items in this collection.
 * | `items`         | [`Summary`](data-types.md#summary) | The list of returned issues in this collection.
 */
export type Collection = z.infer<typeof ListSchema>;

/**| Property        | Type                                         | Description                                                  
 * | --------------- | -------------------------------------------- | ------------------------------------------------------------ 
 * | `available`     | `number`                                     | The number of total available issues in this list. Will always be greater than or equal to the "returned" value. 
 * | `returned`      | `number`                                     | The number of issues returned in this collection (up to 20). 
 * | `collectionURI` | `string`                                     | The path to the full list of issues in this collection.      
 * | `items`         | [`ComicSummary`](data-types.md#comicsummary) | The list of returned issues in this collection.              
 */
export type ComicList = z.infer<typeof ComicListSchema>;

/**| Property        | Type                                         | Description
 * | --------------- | -------------------------------------------- | ------------------------------------------------------------
 * | `available`     | `number`                                     | The number of total available stories in this list. Will always be greater than or equal to the "returned" value. 
 * | `returned`      | `number`                                     | The number of stories returned in this collection (up to 20).
 * | `collectionURI` | `string`                                     | The path to the full list of stories in this collection.
 * | `items`         | [`StorySummary`](data-types.md#storysummary) | The list of returned stories in this collection.
 */
export type StoryList = z.infer<typeof StoryListSchema>;

/**| Property        | Type                                           | Description                                                  
 * | --------------- | ---------------------------------------------- | ------------------------------------------------------------ 
 * | `available`     | `number`                                       | The number of total available series in this list. Will always be greater than or equal to the "returned" value. 
 * | `returned`      | `number`                                       | The number of series returned in this collection (up to 20). 
 * | `collectionURI` | `string`                                       | The path to the full list of series in this collection.      
 * | `items`         | [`SeriesSummary`](data-types.md#seriessummary) | The list of returned series in this collection.              
 */
export type SeriesList = z.infer<typeof SeriesListSchema>;

/**| Property        | Type                                         | Description                                                  
 * | --------------- | -------------------------------------------- | ------------------------------------------------------------ 
 * | `available`     | `number`                                     | The number of total available events in this list. Will always be greater than or equal to the "returned" value. 
 * | `returned`      | `number`                                     | The number of events returned in this collection (up to 20). 
 * | `collectionURI` | `string`                                     | The path to the full list of events in this collection.      
 * | `items`         | [`EventSummary`](data-types.md#eventsummary) | The list of returned events in this collection.              
 */
export type EventList = z.infer<typeof EventListSchema>;

/**| Property        | Type                                             | Description                                                  
 * | --------------- | ------------------------------------------------ | ------------------------------------------------------------ 
 * | `available`     | `number`                                         | The number of total available creators in this list. Will always be greater than or equal to the "returned" value. 
 * | `returned`      | `number`                                         | The number of creators returned in this collection (up to 20). 
 * | `collectionURI` | `string`                                         | The path to the full list of creators in this collection.    
 * | `items`         | [`CreatorSummary`](data-types.md#creatorsummary) | The list of returned creators in this collection.            
 */
export type CreatorList = z.infer<typeof CreatorListSchema>;

/**| Property        | Type                                                 | Description                                                  
 * | --------------- | ---------------------------------------------------- | ------------------------------------------------------------ 
 * | `available`     | `number`                                             | The number of total available characters in this list. Will always be greater than or equal to the "returned" value. 
 * | `returned`      | `number`                                             | The number of characters returned in this collection (up to 20). 
 * | `collectionURI` | `string`                                             | The path to the full list of characters in this collection.  
 * | `items`         | [`CharacterSummary`](data-types.md#charactersummary) | The list of returned characters in this collection.          
 */
export type CharacterList = z.infer<typeof CharacterListSchema>;

/**| Property      | Type                          | Description                                       
 * | ------------- | ----------------------------- | ------------------------------------------------- 
 * | `id`          | `number`                      | The unique ID of the resource.                    
 * | `resourceURI` | `string`                      | The canonical URL identifier for this resource.   
 * | `modified`    | `string`                      | The date the resource was most recently modified. 
 * | `urls`        | [`URL[]`](data-types.md/#url) | A set of public web site URLs for the resource.   
 * | `thumbnail`   | [`Image`](data-types.md/#image) | The representative image for this item.
 */
export type MarvelResult = z.infer<typeof MarvelResultSchema>;

/**| Property             | Type                                              | Description                                                  
 * | -------------------- | ------------------------------------------------- | ------------------------------------------------------------ 
 * | `id`                 | `number`                                          | The unique ID of the comic resource.                         
 * | `resourceURI`        | `string`                                          | The canonical URL identifier for this resource.              
 * | `modified`           | `string`                                          | The date the resource was most recently modified.            
 * | `urls`               | [`URL[]`](data-types.md/#url)                     | A set of public web site URLs for the resource.              
 * | `thumbnail`          | [`Image`](data-types.md/#image)                   | The representative image for this comic.                     
 * | `digitalId`          | `number`                                          | The ID of the digital comic representation of this comic. Will be 0 if the comic is not available digitally. 
 * | `title`              | `string`                                          | The canonical title of the comic.                            
 * | `issueNumber`        | `number`                                          | The number of the issue in the series (will generally be 0 for collection formats). 
 * | `variantDescription` | `string`                                          | If the issue is a variant (e.g. an alternate cover, second printing, or director’s cut), a text description of the variant. 
 * | `description`        | `string`                                          | The preferred description of the comic.                      
 * | `isbn`               | `string`                                          | The ISBN for the comic (generally only populated for collection formats). 
 * | `upc`                | `string`                                          | The UPC barcode number for the comic (generally only populated for periodical formats). 
 * | `diamondCode`        | `string`                                          | The Diamond code for the comic.                              
 * | `ean`                | `string`                                          | The EAN barcode for the comic.                               
 * | `issn`               | `string`                                          | The ISSN barcode for the comic.                              
 * | `format`             | [`Format`](api-parameters.md/#format)             | The format of the comic e.g. comic, digital comic, hardcover, trade paperback. 
 * | `pageCount`          | `number`                                          | The number of pages in the comic.                            
 * | `textObjects`        | [`TextObject[]`](data-types.md/#textobject)       | A set of descriptive text blurbs for the comic.              
 * | `series`             | [`SeriesSummary`](data-types.md/#seriessummary)   | A summary representation of the series to which this comic belongs. 
 * | `variants`           | [`ComicSummary[]`](data-types.md#comicsummary)    | A list of variant issues for this comic (includes the "original" issue if the current issue is a variant). 
 * | `collections`        | [`ComicSummary[]`](data-types.md#comicsummary)    | A list of collections which include this comic (will generally be empty if the comic's format is a collection). 
 * | `collectedIssues`    | [`ComicSummary[]`](data-types.md#comicsummary)    | A list of issues collected in this comic (will generally be empty for periodical formats such as "comic" or "magazine" 
 * | `dates`              | [`ComicDate[]`](data-types.md#comicdate)          | A list of key dates for this comic.                          
 * | `prices`             | [`ComicPrice[]`](data-types.md#comicprice)        | A list of prices for this comic.                             
 * | `images`             | [`Image[]`](data-types.md#image`)                 | A list of promotional images associated with this comic.     
 * | `creators`           | [`CreatorList`](data-types.md#creatorlist)        | A resource list containing the creators associated with this comic. 
 * | `characters`         | [`CharacterList`](data-types.md#characterlist)    | A resource list containing the characters in this comic.     
 * | `stories`            | [`StoryList`](data-types.md#storylist)            | A resource list containing the stories which appear in this comic. 
 * | `events`             | [`EventList`](data-types.md#eventlist)            | A resource list containing the events in which this comic appears. 
 */
export type MarvelComic = z.infer<typeof MarvelComicSchema>;

/**| Property      | Type                                           | Description                                                  
 * | ------------- | ---------------------------------------------- | ------------------------------------------------------------ 
 * | `id`          | `number`                                       | The unique ID of the event resource.                         
 * | `resourceURI` | `string`                                       | The canonical URL identifier for this resource.              
 * | `modified`    | `string`                                       | The date the resource was most recently modified.            
 * | `urls`        | [`URL[]`](data-types.md#url)                   | A set of public web site URLs for the resource.              
 * | `thumbnail`   | [`Image`](data-types.md#image)                 | The representative image for this event.                     
 * | `title`       | `string`                                       | The title of the event.                                      
 * | `description` | `string`                                       | A description of the event.                                  
 * | `start`       | `YYYY-MM-DD HH:MM:SS`                          | The date of publication of the first issue in this event     
 * | `end`         | `YYYY-MM-DD HH:MM:SS`                          | The date of publication of the last issue in this event      
 * | `comics`      | [`ComicList`](data-types.md#comiclist)         | A resource list containing the comics in this event.         
 * | `stories`     | [`StoryList`](data-types.md#storylist)         | A resource list containing the stories in this event.        
 * | `series`      | [`SeriesList`](data-types.md#serieslist)       | A resource list containing the series in this event.         
 * | `characters`  | [`CharacterList`](data-types.md#characterlist) | A resource list containing the characters which appear in this event. 
 * | `creators`    | [`CreatorList`](data-types.md#creatorlist)     | A resource list containing creators whose work appears in this event. 
 * | `next`        | [`EventSummary[]`](data-types.md#eventsummary) | A summary representation of the event which follows this event in the timeline. 
 * | `previous`    | [`EventSummary[]`](data-types.md#eventsummary) | A summary representation of the event which preceded this event in the timeline. 
 */
export type MarvelEvent = z.infer<typeof MarvelEventSchema>;

/**| Property      | Type                                           | Description                                                  
 * | ------------- | ---------------------------------------------- | ------------------------------------------------------------ 
 * | `id`          | `number`                                       | The unique ID of the series resource.                        
 * | `resourceURI` | `string`                                       | The canonical URL identifier for this resource.              
 * | `modified`    | `string`                                       | The date the resource was most recently modified.            
 * | `urls`        | [`URL[]`](data-types.md#url)                   | A set of public web site URLs for the resource.              
 * | `thumbnail`   | [`Image`](data-types.md#image)                 | The representative image for this series.                    
 * | `title`       | `string`                                       | The canonical title of the series.                           
 * | `description` | `string`                                       | A description of the series.                                 
 * | `startYear`   | `number`                                       | The first year in which the series has been published.       
 * | `endYear`     | `number`                                       | The last year of publication for the series (conventionally, 2099 for ongoing series). 
 * | `rating`      | `string`                                       | The age-appropriateness rating for the series.               
 * | `comics`      | [`ComicList`](data-types.md#comiclist)         | A resource list containing comics in this series.            
 * | `stories`     | [`StoryList`](data-types.md#storylist)         | A resource list containing stories which occur in comics in this series. 
 * | `events`      | [`EventList`](data-types.md#eventlist)         | A resource list containing events which take place in comics in this series. 
 * | `characters`  | [`CharacterList`](data-types.md#characterlist) | A resource list containing the characters which appear in this series. 
 * | `creators`    | [`CreatorList`](data-types.md#creatorlist)     | A resource list containing creators whose work appears in this series. 
 * | `next`        | [`SeriesSummary`](data-types.md#seriessummary) | A summary representation of the series which follows this series in the timeline. 
 * | `previous`    | [`SeriesSummary`](data-types.md#seriessummary) | A summary representation of the series which preceded this series in the timeline. 
 */
export type MarvelSeries = z.infer<typeof MarvelSeriesSchema>;

/**| Property      | Type                                     | Description                                                  
 * | ------------- | ---------------------------------------- | ------------------------------------------------------------ 
 * | `id`          | `number`                                 | The unique ID of the creator resource.                       
 * | `resourceURI` | `string`                                 | The canonical URL identifier for this resource.              
 * | `modified`    | `string`                                 | The date the resource was most recently modified.            
 * | `urls`        | [`URL[]`](data-types.md#url)             | A set of public web site URLs for the resource.              
 * | `thumbnail`   | [`Image`](data-types.md#image)           | The representative image for this creator.                   
 * | `firstName`   | `string`                                 | The first name of the creator.                               
 * | `middleName`  | `string`                                 | The middle name of the creator.                              
 * | `lastName`    | `string`                                 | The last name of the creator.                                
 * | `suffix`      | `string`                                 | The suffix or honorific for the creator.                     
 * | `fullName`    | `string`                                 | The full name of the creator (a space-separated concatenation of the above four fields). 
 * | `series`      | [`SeriesList`](data-types.md#serieslist) | A resource list containing the series which feature work by this creator. 
 * | `stories`     | [`StoryList`](data-types.md#storylist)   | A resource list containing the stories which feature work by this creator. 
 * | `comics`      | [`ComicList`](data-types.md#comiclist)   | A resource list containing the comics which feature work by this creator. 
 * | `events`      | [`EventList`](data-types.md#eventlist)   | A resource list containing the events which feature work by this creator. 
 */
export type MarvelCreator = z.infer<typeof MarvelCreatorSchema>;

/**| Property      | Type                                     | Description                                                  
 * | ------------- | ---------------------------------------- | ------------------------------------------------------------ 
 * | `id`          | `number`                                 | The unique ID of the character resource.                     
 * | `resourceURI` | `string`                                 | The canonical URL identifier for this resource.              
 * | `modified`    | `string`                                 | The date the resource was most recently modified.            
 * | `urls`        | [`URL[]`](data-types.md#url)             | A set of public web site URLs for the resource.              
 * | `thumbnail`   | [`Image`](data-types.md#image)           | The representative image for this character.                 
 * | `name`        | `string`                                 | The name of the character.                                   
 * | `description` | `string`                                 | A short bio or description of the character.                 
 * | `comics`      | [`ComicList`](data-types.md#comiclist)   | A resource list containing comics which feature this character. 
 * | `stories`     | [`StoryList`](data-types.md#storylist)   | A resource list containing the stories in which this character appears. 
 * | `events`      | [`EventList`](data-types.md#eventlist)   | A resource list containing the events in which this character appears. 
 * | `series`      | [`SeriesList`](data-types.md#serieslist) | A resource list containing the series in which this character appears. 
 */
export type MarvelCharacter = z.infer<typeof MarvelCharacterSchema>;

/**| Property        | Type                                           | Description                                                  
 * | --------------- | ---------------------------------------------- | ------------------------------------------------------------ 
 * | `id`            | `number`                                       | The unique ID of the story resource.                         
 * | `resourceURI`   | `string`                                       | The canonical URL identifier for this resource.              
 * | `modified`      | `string`                                       | The date the resource was most recently modified.            
 * | `urls`          | [`URL[]`](data-types.md#url)                   | A set of public web site URLs for the resource.              
 * | `thumbnail`     | [`Image`](data-types.md#image)                 | The representative image for this story.                     
 * | `title`         | `string`                                       | The story title.                                             
 * | `description`   | `string`                                       | A description of the story.                                  
 * | `type`          | `string`                                       | The story type e.g. interior story, cover, text story.       
 * | `comics`        | [`ComicList`](data-types.md#comiclist)         | A resource list containing comics in which this story takes place. 
 * | `series`        | [`SeriesList`](data-types.md#serieslist)       | A resource list containing series in which this story appears. 
 * | `events`        | [`EventList`](data-types.md#eventlist)         | A resource list containing events in which this story appears. 
 * | `characters`    | [`CharacterList`](data-types.md#characterlist) | A resource list containing the characters which appear in this story. 
 * | `creators`      | [`CreatorList`](data-types.md#creatorlist)     | A resource list of creators who worked on this story.        
 * | `originalIssue` | [`ComicSummary`](data-types.md#comicsummary)   | A summary representation of the issue in which this story was originally published. 
 */
export type MarvelStory = z.infer<typeof MarvelStorySchema>;

/** Metadata included in the API response.
 * | Property          | Type            | Description                                                  
 * | ----------------- | --------------- | ------------------------------------------------------------ 
 * | `code`            | `number`        | The HTTP status code of the returned result.                 
 * | `status`          | `string`        | A string description of the call status.                     
 * | `copyright`       | `string`        | The copyright notice for the returned result.                
 * | `attributionText` | `string`        | The attribution notice for this result. Please display either this notice or the contents of the attributionHTML field on all screens which contain data from the Marvel Comics API. 
 * | `attributionHTML` | `string`        | An HTML representation of the attribution notice for this result. Please display either this notice or the contents of the attributionText field on all screens which contain data from the Marvel Comics API. 
 * | `etag`            | `string`        | A digest value of the content returned by the call.          
 */
export interface Metadata {
  code: number;
  status: string;
  copyright: string;
  attributionText: string;
  attributionHTML: string;
  etag: string;
}

/** DataContainer of the API response
 * | Property  | Type     | Description                                                  
 * | --------- | -------- | ------------------------------------------------------------ 
 * | `offset`  | `number` | The requested offset (number of skipped results) of the call. 
 * | `limit`   | `number` | The requested result limit.                                  
 * | `total`   | `number` | The total number of resources available given the current filter set. 
 * | `count`   | `number` | The total number of results returned by this call.           
 * | `results` | `R[]`    | The results of the query.                                  
 */
export interface APIResponse<R extends MarvelResult> {
  offset: number;
  limit: number;
  total: number;
  count: number;
  results: R[];
}

/** DataWrapper of the API response
 * | Property          | Type            | Description                                                  
 * | ----------------- | --------------- | ------------------------------------------------------------ 
 * | `code`            | `number`        | The HTTP status code of the returned result.                 
 * | `status`          | `string`        | A string description of the call status.                     
 * | `copyright`       | `string`        | The copyright notice for the returned result.                
 * | `attributionText` | `string`        | The attribution notice for this result. Please display either this notice or the contents of the attributionHTML field on all screens which contain data from the Marvel Comics API. 
 * | `attributionHTML` | `string` `HTML` | An HTML representation of the attribution notice for this result. Please display either this notice or the contents of the attributionText field on all screens which contain data from the Marvel Comics API. 
 * | `etag`            | `string`        | A digest value of the content returned by the call.          
 * | `data`            | `APIResponse`   | The data container of the API response.                      
 */
export interface APIWrapper<R extends MarvelResult> extends Metadata {
  data: APIResponse<R>;
}
