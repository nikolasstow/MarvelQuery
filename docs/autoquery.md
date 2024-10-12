# Understanding AutoQuery

AutoQuery is a powerful feature that automatically injects methods and properties into API responses wherever a URI is found. These additions allow you to seamlessly create follow-up queries directly from the result data, without manually constructing new queries. By detecting URIs associated with related resources or collections (such as comics, characters, or creators), AutoQuery makes it easy to navigate through connected data. For example, once you retrieve a character, you can use the injected query methods to fetch related comics or other associated resources with minimal effort.

First lets take a look an Event result type and take note of the URI's found within it:
```ts
interface Event {
  id: number;
  resourceURI: string; // <-- Resource URI
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
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
    }>;
  };
  stories: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
      type: string;
    }>;
  };
  series: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
    }>;
  };
  characters: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
      role: string;
    }>;
  };
  creators: {
    available: number;
    returned: number;
    collectionURI: string; // <-- Collection URI
    items: Array<{
      resourceURI: string; // <-- Resource URI
      name: string;
      role: string;
    }>;
  };
  next: {
    resourceURI: string; // <-- Resource URI
    name: string;
  };
  previous: {
    resourceURI: string; // <-- Resource URI
    name: string;
  };
}
```

## Collections and Resources

Take a look at the Collection URIs, then at Resource URIs, you should see they each follow a strict structure:

```ts
interface Resource {
	resourceURI: string; // <-- Resource URI
	name: string;
	role?: string; // Creators and Characters have a 'role' field
	type?: string; // Stories have a 'type' field
}

interface Collection {
	available: number;
	returned: number;
	collectionURI: string; // <-- Collection URI
	items: Array<Resource>
}
```

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

