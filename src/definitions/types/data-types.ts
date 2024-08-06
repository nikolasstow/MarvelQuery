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
  ComicSummarySchema,
  StorySummarySchema,
  SeriesSummarySchema,
  CreatorSummarySchema,
  CharacterSummarySchema,
  EventSummarySchema,
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

type FormattedResult<Z extends z.ZodType<any, any>, QF> = z.infer<Z> & {
  query: QF;
}

/**| Property   | Type     | Description                                                 
 * | ---------- | -------- | ------------------------------------------------------------
 * | `type`     | `string` | Only return resources created or changed since the specified date.
 * | `language` | `string` | The IETF language tag denoting the language the text object is written in. 
 * | `text`     | `string` | The text.                                                    
 */
export type TextObject = z.infer<typeof TextObjectSchema>;
/**| Property | Type     | Description                                      |
 * | -------- | -------- | ------------------------------------------------ |
 * | `type`   | `string` | A text identifier for the URL.                   |
 * | `url`    | `string` | A full URL (including scheme, domain, and path). |
 */
export type URL = z.infer<typeof URLSchema>;
/**| Property    | Type     | Description                                      |
 * | ----------- | -------- | ------------------------------------------------ |
 * | `path`      | `string` | The directory path of the image.                 |
 * | `extension` | `string` | A full URL (including scheme, domain, and path). |
 */
export type Image = z.infer<typeof ImageSchema>;
/**| Property | Type     | Description                                                 
 * | -------- | -------- | ------------------------------------------------------------ |
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
/**| Property      | Type     | Description                          |
 * | ------------- | -------- | ------------------------------------ |
 * | `resourceURI` | `string` | The path to the individual resource. |
 * | `name`        | `string` | The canonical name of the resource.  |
 */
export type Summary = z.infer<typeof SummarySchema>;
/**| Property      | Type     | Description                                  |
 * | ------------- | -------- | -------------------------------------------- |
 * | `resourceURI` | `string` | The path to the individual resource.         |
 * | `name`        | `string` | The canonical name of the resource.          |
 * | `role`        | `string` | The role of the person in the parent entity. |
 */
export type RoleSummary = z.infer<typeof RoleSummarySchema>;
/**| Property      | Type     | Description                          |
 * | ------------- | -------- | ------------------------------------ |
 * | `resourceURI` | `string` | The path to the individual resource. |
 * | `name`        | `string` | The canonical name of the resource.  |
 * | `type`        | `string` | The type of the entity.              |
 */
export type TypeSummary = z.infer<typeof TypeSummarySchema>;
/**| Property      | Type     | Description                                |
 * | ------------- | -------- | ------------------------------------------ |
 * | `resourceURI` | `string` | The path to the individual comic resource. |
 * | `name`        | `string` | The canonical name of the comic.           |
 */
export type ComicSummary = z.infer<typeof ComicSummarySchema>;
/**| Property      | Type     | Description                                |
 * | ------------- | -------- | ------------------------------------------ |
 * | `resourceURI` | `string` | The path to the individual resource.       |
 * | `name`        | `string` | The canonical name of the story.           |
 * | `role`        | `string` | The type of the story (interior or cover). |
 */
export type StorySummary = z.infer<typeof StorySummarySchema>;
/**| Property      | Type     | Description                                 |
 * | ------------- | -------- | ------------------------------------------- |
 * | `resourceURI` | `string` | The path to the individual series resource. |
 * | `name`        | `string` | The canonical name of the series.           |
 */
export type SeriesSummary = z.infer<typeof SeriesSummarySchema>;
/**| Property      | Type     | Description                                   |
 * | ------------- | -------- | --------------------------------------------- |
 * | `resourceURI` | `string` | The path to the individual resource.          |
 * | `name`        | `string` | The full name of the creator.                 |
 * | `role`        | `string` | The role of the creator in the parent entity. |
 */
export type CreatorSummary = z.infer<typeof CreatorSummarySchema>;
/**| Property      | Type     | Description                                     |
 * | ------------- | -------- | ----------------------------------------------- |
 * | `resourceURI` | `string` | The path to the individual resource.            |
 * | `name`        | `string` | The full name of the character.                 |
 * | `role`        | `string` | The role of the character in the parent entity. |
 */
export type CharacterSummary = z.infer<typeof CharacterSummarySchema>;
/**| Property      | Type     | Description                                |
 * | ------------- | -------- | ------------------------------------------ |
 * | `resourceURI` | `string` | The path to the individual event resource. |
 * | `name`        | `string` | The name of the event.                     |
 */
export type EventSummary = z.infer<typeof EventSummarySchema>;
/**| Property        | Type                  | Description                                                  
 * | --------------- | --------------------- | ------------------------------------------------------------ 
 * | `available`     | `number`              | The number of total available resources in this list. Will always be greater than or equal to the "returned" value. 
 * | `returned`      | `number`              | The number of resources returned in this collection (up to 20). 
 * | `collectionURI` | `string`              | The path to the full list of items in this collection.       
 * | `items`         | [`Summary`](#summary) | The list of returned issues in this collection.              
 */
export type List = z.infer<typeof ListSchema>;
/**| Property        | Type                            | Description                                                  |
 * | --------------- | ------------------------------- | ------------------------------------------------------------ |
 * | `available`     | `number`                        | The number of total available issues in this list. Will always be greater than or equal to the "returned" value. |
 * | `returned`      | `number`                        | The number of issues returned in this collection (up to 20). |
 * | `collectionURI` | `string`                        | The path to the full list of issues in this collection.      |
 * | `items`         | [`ComicSummary`](#comicsummary) | The list of returned issues in this collection.              |
 */
export type ComicList = z.infer<typeof ComicListSchema>;
/**| Property        | Type                            | Description                                                  
 * | --------------- | ------------------------------- | ------------------------------------------------------------ 
 * | `available`     | `number`                        | The number of total available stories in this list. Will always be greater than or equal to the "returned" value. |
 * | `returned`      | `number`                        | The number of stories returned in this collection (up to 20).
 * | `collectionURI` | `string`                        | The path to the full list of stories in this collection.     
 * | `items`         | [`StorySummary`](#storysummary) | The list of returned stories in this collection.             
 */
export type StoryList = z.infer<typeof StoryListSchema>;
/**| Property        | Type                              | Description                                                  |
 * | --------------- | --------------------------------- | ------------------------------------------------------------ |
 * | `available`     | `number`                          | The number of total available series in this list. Will always be greater than or equal to the "returned" value. |
 * | `returned`      | `number`                          | The number of series returned in this collection (up to 20). |
 * | `collectionURI` | `string`                          | The path to the full list of series in this collection.      |
 * | `items`         | [`SeriesSummary`](#seriessummary) | The list of returned series in this collection.              |
 */
export type SeriesList = z.infer<typeof SeriesListSchema>;
/**
 * @property available - The number of total available events in this list. Will always be greater than or equal to the "returned" value.,
 * @property returned - The number of events returned in this collection (up to 20).,
 * @property collectionURI - The path to the full list of events in this collection.,
 * @property items - The list of returned events in this collection.
 */
export type EventList = z.infer<typeof EventListSchema>;
/**
 * @property available - The number of total available creators in this list. Will always be greater than or equal to the "returned" value.,
 * @property returned - The number of creators returned in this collection (up to 20).,
 * @property collectionURI - The path to the full list of creators in this collection.,
 * @property items - The list of returned creators in this collection.
 */
export type CreatorList = z.infer<typeof CreatorListSchema>;
/**
 * @property available - The number of total available characters in this list. Will always be greater than or equal to the "returned" value.,
 * @property returned - The number of characters returned in this collection (up to 20).,
 * @property collectionURI - The path to the full list of characters in this collection.,
 * @property items - The list of returned characters in this collection.
 */
export type CharacterList = z.infer<typeof CharacterListSchema>;
/** The base schema for an item in the API response
 * @property id - The unique ID of the resource.
 * @property resourceURI - The canonical URL identifier for this resource.
 * @property modified - The date the resource was most recently modified.
 * @property { URL[] } urls - A set of public web site URLs for the resource.
 * @property { Image } thumbnail - The representative image for this item.
 */
export type MarvelResult = z.infer<typeof MarvelResultSchema>;
/**
 * @property id - The unique ID of the resource.
 * @property resourceURI - The canonical URL identifier for this resource.
 * @property modified - The date the resource was most recently modified.
 * @property { URL[] } urls - A set of public web site URLs for the resource.
 * @property { Image } thumbnail - The representative image for this comic.
 * 
 * @property digitalId - The ID of the digital comic representation of this comic. Will be 0 if the comic is not available digitally.
 * @property title - The canonical title of the comic.
 * @property issueNumber - The number of the issue in the series (will generally be 0 for collection formats).
 * @property variantDescription -  If the issue is a variant (e.g. an alternate cover, second printing, or director’s cut), a text description of the variant.
 * @property description - The preferred description of the comic.
 * @property isbn - The ISBN for the comic (generally only populated for collection formats).
 * @property upc - The UPC barcode number for the comic (generally only populated for periodical formats).
 * @property diamondCode - The Diamond code for the comic.
 * @property ean - The EAN barcode for the comic.
 * @property issn - The ISSN barcode for the comic.
 * @property format - The format of the comic e.g. comic, digital comic, hardcover, trade paperback.
 * @property pageCount - The number of pages in the comic.
 * @property { TextObject[] } textObjects - A set of descriptive text blurbs for the comic.
 * @property { SeriesSummary } series - A summary representation of the series to which this comic belongs.
 * @property { ComicSummary[] } variants - A list of variant issues for this comic (includes the "original" issue if the current issue is a variant).
 * @property { ComicSummary[] } collections - A list of collections which include this comic (will generally be empty if the comic's format is a collection).
 * @property { ComicSummary[] } collectedIssues - A list of issues collected in this comic (will generally be empty for periodical formats such as "comic" or "magazine"
 * @property { ComicDate[] } dates - A list of key dates for this comic.
 * @property { ComicPrice[] } prices - A list of prices for this comic.
 * @property { Image[] } images - A list of promotional images associated with this comic.
 * @property { CreatorList } creators - A resource list containing the creators associated with this comic.
 * @property { CharacterList } characters - A resource list containing the characters in this comic.
 * @property { StoryList } stories - A resource list containing the stories which appear in this comic.
 * @property { EventList } events - A resource list containing the events in which this comic appears.
 */
export type MarvelComic = z.infer<typeof MarvelComicSchema>;
/**
 * @property id - The unique ID of the event resource.
 * @property resourceURI - The canonical URL identifier for this resource.
 * @property modified - The date the resource was most recently modified.
 * @property { URL[] } urls - A set of public web site URLs for the resource.
 * @property { Image } thumbnail - The representative image for this item.
 * 
 * @property title - The title of the event.
 * @property description - A description of the event.
 * @property start - The date of publication of the first issue in this event
 * @property end - The date of publication of the last issue in this event
 * @property { ComicList } comics - A resource list containing the comics in this event.
 * @property { StoryList } stories - A resource list containing the stories in this event.
 * @property { SeriesList } series - A resource list containing the series in this event.
 * @property { CharacterList } characters - A resource list containing the characters which appear in this event.
 * @property { CreatorList } creators - A resource list containing creators whose work appears in this event.
 * @property { EventSummary } next - A summary representation of the event which follows this event in the timeline.
 * @property { EventSummary } previous - A summary representation of the event which preceded this event in the timeline.
 */
export type MarvelEvent = z.infer<typeof MarvelEventSchema>;
/**
 * @property id - The unique ID of the series resource.
 * @property resourceURI - The canonical URL identifier for this series.
 * @property modified - The date the resource was most recently modified.
 * @property { URL[] } urls - A set of public web site URLs for the resource.
 * @property { Image } thumbnail - The representative image for this series.
 * 
 * @property title - The canonical title of the series.
 * @property description - A description of the series.
 * @property startYear - The first year in which the series has been published.
 * @property endYear - The last year of publication for the series (conventionally, 2099 for ongoing series).
 * @property rating - The age-appropriateness rating for the series.
 * @property { ComicList } comics - A resource list containing comics in this series.
 * @property { StoryList } stories - A resource list containing stories which occur in comics in this series.
 * @property { EventList } events - A resource list containing events which take place in comics in this series.
 * @property { CharacterList } characters - A resource list containing the characters which appear in this series.
 * @property { CreatorList } creators - A resource list containing creators whose work appears in this series.
 * @property { SeriesSummary } next - A summary representation of the series which follows this series in the timeline.
 * @property { SeriesSummary } previous - A summary representation of the series which preceded this series in the timeline.
 */
export type MarvelSeries = z.infer<typeof MarvelSeriesSchema>;
/**
 * @property id - The unique ID of the creator resource.
 * @property resourceURI - The canonical URL identifier for this resource.
 * @property modified - The date the resource was most recently modified.
 * @property { URL[] } urls - A set of public web site URLs for the resource.
 * @property { Image } thumbnail - The representative image for this creator.
 * 
 * @property firstName - The first name of the creator.
 * @property middleName - The middle name of the creator.
 * @property lastName - The last name of the creator.
 * @property suffix - The suffix or honorific for the creator.
 * @property fullName - The full name of the creator (a space-separated concatenation of the above four fields).
 * @property { SeriesList } series - A resource list containing the series which feature work by this creator.
 * @property { StoryList } stories - A resource list containing the stories which feature work by this creator.
 * @property { ComicList } comics - A resource list containing the comics which feature work by this creator.
 * @property { EventList } events - A resource list containing the events which feature work by this creator.
 */
export type MarvelCreator = z.infer<typeof MarvelCreatorSchema>;
/**
 * @property id - The unique ID of the character resource.
 * @property resourceURI - The canonical URL identifier for this resource.
 * @property modified - The date the resource was most recently modified.
 * @property { URL[] } urls - A set of public web site URLs for the resource.
 * @property { Image } thumbnail - The representative image for this character.
 * 
 * @property name - The name of the character.
 * @property description - A short bio or description of the character.
 * @property { ComicList } comics -  A resource list containing comics which feature this character.
 * @property { StoryList } stories - A resource list containing the stories in which this character appears.
 * @property { EventList } events - A resource list containing the events in which this character appears.
 * @property { SeriesList } series - A resource list containing the series in which this character appears.
 */
export type MarvelCharacter = z.infer<typeof MarvelCharacterSchema>;
/**
 * @property id - The unique ID of the story resource.
 * @property resourceURI - The canonical URL identifier for this resource.
 * @property modified - The date the resource was most recently modified.
 * @property { URL[] } urls - A set of public web site URLs for the resource.
 * @property { Image } thumbnail - The representative image for this story.
 * 
 * @property title - The story title.
 * @property description - A description of the story.
 * @property type - The story type e.g. interior story, cover, text story.
 * @property { ComicList } comics - A resource list containing comics in which this story takes place.
 * @property { SeriesList } series - A resource list containing series in which this story appears.
 * @property { EventList } events - A resource list containing events in which this story appears.
 * @property { CharacterList } characters - A resource list containing the characters which appear in this story.
 * @property { CreatorList } creators - A resource list of creators who worked on this story.
 * @property { ComicSummary} originalIssue - A summary representation of the issue in which this story was originally published.
 */
export type MarvelStory = z.infer<typeof MarvelStorySchema>;

/** Metadata included in the API response.
 * @property code: The HTTP status code of the returned result.
 * @property status: A string description of the call status.
 * @property copyright: The copyright notice for the returned result.
 * @property attributionText: The attribution notice for this result. Please display either this notice or the contents of the attributionHTML field on all screens which contain data from the Marvel Comics API.
 * @property attributionHTML: An HTML representation of the attribution notice for this result. Please display either this notice or the contents of the attributionText field on all screens which contain data from the Marvel Comics API.
 * @property etag: A digest value of the content returned by the call.
 */
export interface Metadata {
  code: number;
  status: string;
  copyright: string;
  attributionText: string;
  attributionHTML: string;
  etag: string;
}

/** Data for the API response.
 * @property offset: The requested offset (number of skipped results) of the call.
 * @property limit: The requested result limit.
 * @property total: The total number of resources available given the current filter set.
 * @property count: The total number of results returned by this call.
 */
export interface APIResponseData {
  offset: number;
  limit: number;
  total: number;
  count: number;
}

/** DataContainer of the API response
 * @property offset: The requested offset (number of skipped results) of the call.
 * @property limit: The requested result limit.
 * @property total: The total number of resources available given the current filter set.
 * @property count: The total number of results returned by this call
 * @property results: The results of the query
 */
export interface APIResponseResults<R extends MarvelResult>
  extends APIResponseData {
  results: R[];
}

/** DataWrapper of the API response
 * @property code: The HTTP status code of the returned result.
 * @property status: A string description of the call status.
 * @property copyright: The copyright notice for the returned result.
 * @property attributionText: The attribution notice for this result. Please display either this notice or the contents of the attributionHTML field on all screens which contain data from the Marvel Comics API.
 * @property attributionHTML: An HTML representation of the attribution notice for this result. Please display either this notice or the contents of the attributionText field on all screens which contain data from the Marvel Comics API.
 * @property etag: A digest value of the content returned by the call.
 * @property data: The results returned by the call.
 */
export interface APIWrapper<R extends MarvelResult> extends Metadata {
  data: APIResponseResults<R>;
}