# AutoQuery: Building Blocks

AutoQuery is a powerful feature that automatically injects methods and properties into API responses wherever a URI is found. These additions allow you to seamlessly create follow-up queries directly from the result data, without manually constructing new queries. By detecting URIs associated with related resources or collections (such as comics, characters, or creators), AutoQuery makes it easy to navigate through connected data. For example, once you retrieve a character, you can use the injected query methods to fetch related comics or other associated resources with minimal effort.

Let’s look at an **Event** item as returned by the Marvel API:

| Property      | Type                       | Description                                                  |
| ------------- | -------------------------- | ------------------------------------------------------------ |
| `id`          | `number`                   | The unique ID of the event resource.                         |
| `resourceURI` | `string`                   | The canonical URL identifier for this resource.              |
| `modified`    | `string`                   | The date the resource was most recently modified.            |
| `urls`        | [`URL[]`](#url)            | A set of public web site URLs for the resource.              |
| `thumbnail`   | [`Image`](#image)          | The representative image for this event.                     |
| `title`       | `string`                   | The title of the event.                                      |
| `description` | `string`                   | A description of the event.                                  |
| `start`       | `YYYY-MM-DD HH:MM:SS`      | The date of publication of the first issue in this event     |
| `end`         | `YYYY-MM-DD HH:MM:SS`      | The date of publication of the last issue in this event      |
| `comics`      | [`List`](#comiclist)       | A resource list containing the comics in this event.         |
| `stories`     | [`List`](#storylist)       | A resource list containing the stories in this event.        |
| `series`      | [`List`](#serieslist)      | A resource list containing the series in this event.         |
| `characters`  | [`List`](#characterlist)   | A resource list containing the characters which appear in this event. |
| `creators`    | [`List`](#creatorlist)     | A resource list containing creators whose work appears in this event. |
| `next`        | [`Summary`](#eventsummary) | A summary representation of the event which follows this event in the timeline. |
| `previous`    | [`Summary`](#eventsummary) | A summary representation of the event which preceded this event in the timeline. |

Looking at the structure of the **Event** item, you’ll notice patterns that help us understand how resources are organized. The properties named `comics`, `stories`, `characters`, and `creators` are all **Lists**, which represent collections of related resources. These lists align with the six root-level data types defined by the EndpointType union, described [here](endpoints.md#endpointtype). Each result type contains lists for each of the other five resource types, excluding itself. For instance, an Event result won’t contain an events property, but it will include the others as shown above.

There are a few notable exceptions: a **Creator** result does not have a characters property, and while a **Comic** result contains a series property, it is a **Summary** rather than a **List** because a comic belongs to only one series. 

## Collections (`List`)x

Each **List** represents a collection of related resources. It includes properties such as available and returned to track the total and currently returned items, a collectionURI pointing to the full collection, and an items array containing **Summaries** of the returned resources.

| Property        | Type                                                     | Description                                                  |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `available`     | `number`                                                 | The number of total available resources in this list. Will always be greater than or equal to the "returned" value. |
| `returned`      | `number`                                                 | The number of resources returned in this collection (up to 20). |
| `collectionURI` | `string`                                                 | The path to the full list of items in this collection.       |
| `items`         | [`Summary`](#summary)                                    | The list of returned items in this collection.               |
| **`endpoint`**  | [`Endpoint`](endpoints.md#endpoint-path-as-tuple)        | A collection endpoint contains three elements: `[${resourceType}, ${id}, ${collectionType}']` (example: `["events", 123, "comics"]`). |
| **`query()`**   | [`QueryResource`](autoquery.md#resources-with-autoquery) | Query the collection, filtering the resources by the parameters. |

**Injected Properties and Methods**

Using the `collectionURI`, the AutoQuery feature injects two key additions into Lists:

- `endpoint`: Provides the endpoint path as a tuple, as well as the data type it returns.
- `query()`: A method that allows you to query the collection directly, using parameters to refine the search.

## Resources (`Summary`)

A **Summary** represents a single resource and provides key information about that resource in a compact form. Summaries are typically found as an array within the items property of a **List**, but they can also appear in other places throughout the API. For example, in a **Comic**, Summary arrays are used in properties like `variants`, `collections`, and `collectedIssues`. Additionally, summaries are used as the type for properties such as `next` and` previous` in an **Event** or **Series**, as well as `originalIssue` in a **Story**. Some summaries, like those for **Characters** and **Creators**, include additional properties such as `role`, while **Story** summaries include a `type` property to specify the type of story.

| Property            | Type                                                     | Description                                                  |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `resourceURI`       | `string`                                                 | The path to the individual resource.                         |
| `name`              | `string`                                                 | The canonical name of the resource.                          |
| **`id`**            | `number`                                                 | The unique ID of the resource.                               |
| **`endpoint`**      | [`Endpoint`](endpoints.md#endpoint-path-as-tuple)        | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["comics", 123]`). |
| **`query()`**       | [`QueryResource`](autoquery.md#resources-with-autoquery) | Query a collection relating to the item.                     |
| **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)                | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`MarvelResult`](#marvelresult)                          | Fetches and returns the resource.                            |

**Injected Properties and Methods**

Using the resourceURI, the AutoQuery feature injects several key additions into Summaries:

	- `id`: Extracts the unique ID from the resource’s URI for easy reference.
	- `endpoint`: Provides the endpoint path as a tuple, as well as the data type it returns.
	- `query()`: A method that allows you to query a collection related to the resource directly from the summary.
	- `fetch()`: Fetches the resource and returns a MarvelQuery instance, placing the result inside the results array.
	- `fetchSingle()`:  Fetches and returns the resource as a single item.

## Result Properties

At the root level, the result represents a resource, meaning we can treat it just like a **Summary**. As a result, AutoQuery injects the same properties and methods directly into the resource, giving you powerful tools for seamless follow-up queries. Below is an example of an **Event** result, showing both the original and injected properties:

| Property            | Type                                                     | Description                                                  |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| **`endpoint`**      | [`Endpoint`](endpoints.md#endpoint-path-as-tuple)        | A resource endpoint contains two elements: `[${type}, ${id}']` (example: `["events", 123]`). |
| **`query()`**       | [`QueryResource`](autoquery.md#resources-with-autoquery) | Query a collection relating to the event.                    |
| **`fetch()`**       | [`Promise<MarvelQuery>`](marvel-query.md)                | Fetches the resource and returns a MarvelQuery instance with the resource in the results array. |
| **`fetchSingle()`** | [`Promise<Event>`](#marvelevent)                         | Fetches and returns the resource.                            |
| `id`                | `number`                                                 | The unique ID of the event resource.                         |
| `resourceURI`       | `string`                                                 | The canonical URL identifier for this resource.              |
| `modified`          | `string`                                                 | The date the resource was most recently modified.            |
| `urls`              | [`URL[]`](#url)                                          | A set of public web site URLs for the resource.              |
| `thumbnail`         | [`Image`](#image)                                        | The representative image for this event.                     |
| `title`             | `string`                                                 | The title of the event.                                      |
| `description`       | `string`                                                 | A description of the event.                                  |
| `start`             | `YYYY-MM-DD HH:MM:SS`                                    | The date of publication of the first issue in this event     |
| `end`               | `YYYY-MM-DD HH:MM:SS`                                    | The date of publication of the last issue in this event      |
| `comics`            | [`ComicList`](#comiclist)                                | A resource list containing the comics in this event.         |
| `stories`           | [`StoryList`](#storylist)                                | A resource list containing the stories in this event.        |
| `series`            | [`SeriesList`](#serieslist)                              | A resource list containing the series in this event.         |
| `characters`        | [`CharacterList`](#characterlist)                        | A resource list containing the characters which appear in this event. |
| `creators`          | [`CreatorList`](#creatorlist)                            | A resource list containing creators whose work appears in this event. |
| `next`              | [`EventSummary`](#eventsummary)                          | A summary representation of the event which follows this event in the timeline. |
| `previous`          | [`EventSummary`](#eventsummary)                          | A summary representation of the event which preceded this event in the timeline. |

For a detailed breakdown of all the data-types returned by the Marvel API, please reference [API Response](data-types.md)

[**Next: Understanding AutoQuery** →](api-parameters.md)

### Resources with AutoQuery

The resourceURI is used to generate an Endpoint type, tuple, and id. Using these, three methods are injected into the resource: `query()`, `fetch()`, and `fetchSingle()`. The `query()` method works no different than the inital query function; it accepts a type (so long as it's not the same as the resource), and the parameters to filter the query. This query method searches only for related items to the resource, if you want to fetch the resource itself there are two methods available. `fetch()` and `fetchSingle` work in the same way they would when used following any query method, `fetch()` returns a MarvelQuery instance populated with the results, and `fetchSingle()` returns only the result item.

```ts
interface Resource {
	resourceURI: string;
  id: number; // <-- Generated from the resourceURI
  endpoint: { // <-- Generated from the resourceURI
  	path: Endpoint; // ["comics", 90210] (tuple)
    type: EndpointType // "comics"
  }
	name: string;
  fetch(): () => MarvelQuery; // Returns a MarvelQuery instance with the resource
  fetchSingle: () => Result; // Returns a single result (Series, Character, Event, etc...)
  query(): (type, params) => MarvelQuery; // Query related resources (collection)
	role?: string;
	type?: string; 
}
```

### Collections with AutoQuery

Collections are a little simpler. Like a resource, they gain the `endpoint` property, and a query method but with only a single argument: paramters to filter the contents of the collection

```ts
interface Collection {
	available: number;
	returned: number;
	collectionURI: string;
  endpoint: { // <-- Generated from the collectionURI
  	path: Endpoint; // ["comics", 90210, "events"] (tuple)
    type: EndpointType // "events"
  }
  query(): (params) => MarvelQuery;
	items: Array<Resource>
}
```

## Results with AutoQuery

All result types contain a resourceURI, so the properties and methods found in resources with AutoQuery will also be added to each result item. Let's take a look at the same Event result from before, now with AutoQuery Injection:

```ts
interface Event {
  id: number;
  resourceURI: string; // <-- Resource URI
  
  endpoint: { // <-- Generated from the resourceURI
  	path: Endpoint; // ["event", 911] (tuple)
    type: EndpointType // "event"
  }
  fetch(): () => MarvelQuery; // Returns a MarvelQuery instance with the Event in results
  fetchSingle: () => Result; // Returns this Event
  query(): (type, params) => MarvelQuery; // Query related resources (comics, creators, characters)
  
  modified: string;
  urls: URL[];
  thumbnail: Image;
  title: string;
  description: string;
  start: string;
  end: string;
  comics: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    
    endpoint: { // <-- Generated from the collectionURI
  		path: Endpoint; // ["events", 90210, "comics"] (tuple)
  	  type: EndpointType // "comics"
 		}
  	query(): (params) => MarvelQuery; // Query comics featured in the Event
    
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
      
      id: number; // <-- Generated from the resourceURI
      endpoint: { // <-- Generated from the resourceURI
        path: Endpoint; // ["comics", 90210] (tuple)
        type: EndpointType // "comics"
      }
      name: string;
      fetch(): () => MarvelQuery; // Returns a MarvelQuery instance with the Comic
      fetchSingle: () => Result; // Returns a single Comic
      query(): (type, params) => MarvelQuery; // Query related resources (collection)
    }>;
  };
  stories: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    
    endpoint: { // <-- Generated from the collectionURI
  		path: Endpoint; // ["events", 90210, "stories"] (tuple)
  	  type: EndpointType // "stories"
 		}
  	query(): (params) => MarvelQuery; // Query stories featured in the Event
    
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
      type: string;
      
      id: number; // <-- Generated from the resourceURI
      endpoint: { // <-- Generated from the resourceURI
        path: Endpoint; // ["stories", 90210] (tuple)
        type: EndpointType // "stories"
      }
      name: string;
      fetch(): () => MarvelQuery; // Returns a MarvelQuery instance with the Story
      fetchSingle: () => Result; // Returns a single Story
      query(): (type, params) => MarvelQuery; // Query related resources (collection)
    }>;
  };
  series: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    
    endpoint: { // <-- Generated from the collectionURI
  		path: Endpoint; // ["events", 90210, "series"] (tuple)
  	  type: EndpointType // "series"
 		}
  	query(): (params) => MarvelQuery; // Query series featured in the Event
    
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
      
      id: number; // <-- Generated from the resourceURI
      endpoint: { // <-- Generated from the resourceURI
        path: Endpoint; // ["series", 90210] (tuple)
        type: EndpointType // "series"
      }
      name: string;
      fetch(): () => MarvelQuery; // Returns a MarvelQuery instance with the Series
      fetchSingle: () => Result; // Returns a single Series
      query(): (type, params) => MarvelQuery; // Query related resources (collection)
    }>;
  };
  characters: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    
    endpoint: { // <-- Generated from the collectionURI
  		path: Endpoint; // ["events", 90210, "characters"] (tuple)
  	  type: EndpointType // "characters"
 		}
  	query(): (params) => MarvelQuery; // Query characters featured in the Event
    
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
      role: string;
      
      id: number; // <-- Generated from the resourceURI
      endpoint: { // <-- Generated from the resourceURI
        path: Endpoint; // ["characters", 90210] (tuple)
        type: EndpointType // "characters"
      }
      name: string;
      fetch(): () => MarvelQuery; // Returns a MarvelQuery instance with the Character
      fetchSingle: () => Result; // Returns a single Character
      query(): (type, params) => MarvelQuery; // Query related resources (collection)
    }>;
  };
  creators: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    
    endpoint: { // <-- Generated from the collectionURI
  		path: Endpoint; // ["events", 90210, "creators"] (tuple)
  	  type: EndpointType // "creators"
 		}
  	query(): (params) => MarvelQuery; // Query creators featured in the Event
    
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
      role: string;
      
      id: number; // <-- Generated from the resourceURI
      endpoint: { // <-- Generated from the resourceURI
        path: Endpoint; // ["creators", 90210] (tuple)
        type: EndpointType // "creators"
      }
      name: string;
      fetch(): () => MarvelQuery; // Returns a MarvelQuery instance with the Creator
      fetchSingle: () => Result; // Returns a single Creator
      query(): (type, params) => MarvelQuery; // Query related resources (collection)
    }>;
  };
  next: {
    resourceURI: string; // <-- Resource URI
    name: string;
    
    id: number; // <-- Generated from the resourceURI
      endpoint: { // <-- Generated from the resourceURI
        path: Endpoint; // ["events", 90210] (tuple)
        type: EndpointType // "events"
      }
      name: string;
      fetch(): () => MarvelQuery; // Returns a MarvelQuery instance with the Event
      fetchSingle: () => Result; // Returns a single Event
      query(): (type, params) => MarvelQuery; // Query related resources (collection)
  };
  previous: {
    resourceURI: string; // <-- Resource URI
    name: string;
  };
}
```

