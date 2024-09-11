import { CustomLogger } from "./Logger";
import {
  Endpoint,
  EndpointDescriptor,
  EndpointType,
  ExtendCollection,
  ExtendCollectionProperties,
  Extendpoint,
  ExtendResource,
  ExtendResourceList,
  ExtendResourceProperties,
  ExtendResult,
  ExtendType,
  List,
  NoSameEndpointType,
  ResourceEndpoint,
  ResourceItem,
  Result,
  Parameters,
  EndpointMap,
  DataType,
  Summary,
} from "../models/types";
import { InitQuery, MarvelQueryInterface } from "../models/types";
import { ENDPOINT_MAP } from "../models/endpoints";
import { EndpointBuilder } from "./EndpointBuilder";

/**
 * Utility class for auto-query injection that finds URIs in data and injects query methods
 * for interacting with those resources.
 * @template E - The specific endpoint type for which this class handles auto-query injection.
 */
export class AutoQuery<E extends Endpoint> {
  /** The query class used for auto-query injection. */
  createQuery: new <NewEndpoint extends Endpoint>({
    endpoint,
    params,
  }: InitQuery<NewEndpoint>) => MarvelQueryInterface<NewEndpoint>;

  /** The descriptor for the current endpoint. */
  endpoint: EndpointDescriptor<E>;

  /** The resources found in the data, mapped by endpoint type. */
  resources: EndpointMap<Endpoint[]> = {
    comics: [],
    series: [],
    characters: [],
    events: [],
    stories: [],
    creators: [],
  };

  /** The collections found in the data, mapped by endpoint type. */
  collections: EndpointMap<Endpoint[]> = {
    comics: [],
    series: [],
    characters: [],
    events: [],
    stories: [],
    creators: [],
  };

  /** The resource names found in the data, stored in a map with their corresponding endpoints. */
  resourceNames: Map<Endpoint, string> = new Map();

  /** The custom logger instance used for logging actions in the query. */
  logger: CustomLogger;

  /**
   * Constructor to initialize the AutoQuery class with a MarvelQuery class, an endpoint descriptor, and a logger.
   * @param MarvelQueryClass - The class used to create queries for the Marvel API.
   * @param endpoint - The descriptor for the endpoint being processed.
   * @param logger - The custom logger instance for logging actions.
   */
  constructor(
    MarvelQueryClass: new <NewEndpoint extends Endpoint>({
      endpoint,
      params,
    }: InitQuery<NewEndpoint>) => MarvelQueryInterface<NewEndpoint>,
    endpoint: EndpointDescriptor<E>,
    logger: CustomLogger
  ) {
    this.logger = logger;
    this.createQuery = MarvelQueryClass;
    this.endpoint = endpoint;
  }

  /**
   * Injects query methods into the results and extends the result objects.
   * @param results - The array of results to inject queries into.
   * @returns An array of extended results with query methods added.
   */
  inject(results: Result<E>[]): ExtendResult<E>[] {
    this.logger.verbose(`Starting auto-query injection...`);

    const extendedResults = results.map((result) => this.extendResult(result));

    // Log a summary of the auto-query injection process
    this.logAutoQueryInjectionSummary(this.resources, this.collections);
    this.logResourcesAndCollections();

    return extendedResults;
  }

  /**
   * Extends a single result by adding properties and methods for querying resources and collections.
   * @param result - The result object to extend.
   * @returns The extended result object with query methods added.
   */
  extendResult(result: Result<E>): ExtendResult<E> {
    const endpoint = this.endpoint.path;

    /** Extend the properties of the result based on its structure. */
    const propertiesExtended: ExtendType<E> = Object.keys(result).reduce<
      ExtendType<E>
    >((acc, key) => {
      const value = result[key];
      const keyEndpointType: EndpointType | undefined =
        ENDPOINT_MAP[this.endpoint.type][key];

      if (!keyEndpointType) {
        acc[key] = value;
        return acc;
      }

      // Extend resources with a resourceURI
      if (this.hasResourceURI(value)) {
        acc[key] = this.extendResource(value, [keyEndpointType]);
      }
      // Extend collections with a collectionURI
      else if (this.hasCollectionURI(value)) {
        acc[key] = this.extendCollection(
          value,
          keyEndpointType,
          this.findResourceName(result)
        );
      }
      // Extend arrays of resources
      else if (Array.isArray(value) && this.hasResourceURI(value[0])) {
        acc[key] = this.extendResourceArray(value, [keyEndpointType]);
      }

      return acc;
    }, {} as ExtendType<E>);

    // Add result-level properties for fetching and querying
    const resultExtendingProperties: ExtendResourceProperties<E> = {
      endpoint,
      fetch: () => {
        const query = new this.createQuery<E>({
          endpoint,
          params: {},
        });
        return query.fetch();
      },
      fetchSingle: () => {
        const query = new this.createQuery<E>({
          endpoint,
          params: {},
        });
        return query.fetchSingle();
      },
      query: <TType extends NoSameEndpointType<E>>(
        type: TType,
        params: Parameters<Extendpoint<E, TType>>
      ): MarvelQueryInterface<Extendpoint<E, TType>> =>
        new this.createQuery<Extendpoint<E, TType>>({
          endpoint: EndpointBuilder.extendEndpoint(endpoint, type),
          params,
        }),
    };

    // Combine the extended properties and the result-extending properties
    return {
      ...propertiesExtended,
      ...resultExtendingProperties,
    };
  }

  /**
   * Extends a single resource by injecting query methods for fetching or querying the resource.
   * @param value - The resource item to extend.
   * @param baseEndpoint - The base endpoint associated with the resource.
   * @returns The extended resource with additional query methods.
   */
  private extendResource<V extends ResourceItem, BEndpoint extends Endpoint>(
    value: V,
    baseEndpoint: BEndpoint
  ): ExtendResource<ResourceEndpoint<BEndpoint>, V> {
    try {
      const baseType = this.typeFromEndpoint(baseEndpoint);
      const endpoint = this.extractEndpointFromURI(value.resourceURI);
      this.assertResourceEndpoint(baseType, endpoint);

      // Add the resource to the resources map
      this.resources[baseType].push(endpoint);
      this.resourceNames.set(endpoint, this.findResourceName(value));

      const additionalProps: ExtendResourceProperties<
        ResourceEndpoint<BEndpoint>
      > = {
        endpoint,
        fetch: () => {
          const query = new this.createQuery({
            endpoint,
            params: {},
          });

          return query.fetch();
        },
        fetchSingle: () => {
          const query = new this.createQuery({
            endpoint,
            params: {},
          });

          return query.fetchSingle();
        },
        query: <TType extends EndpointType>(
          type: TType,
          params: Parameters<
            Extendpoint<ResourceEndpoint<BEndpoint>, TType>
          > = {}
        ): MarvelQueryInterface<
          Extendpoint<ResourceEndpoint<BEndpoint>, TType>
        > =>
          new this.createQuery<Extendpoint<ResourceEndpoint<BEndpoint>, TType>>(
            {
              endpoint: EndpointBuilder.extendEndpoint(endpoint, type),
              params,
            }
          ),
      };

      return {
        ...value,
        ...additionalProps,
      };
    } catch (error) {
      this.logger.error(`Failed to determine resource endpoint: ${error}`);

      const errorFunction = (...args) => {
        return Promise.reject(error);
      };

      const additionalProps = {
        endpoint: null,
        fetch: errorFunction,
        fetchSingle: errorFunction,
        query: errorFunction,
      };

      return { ...value, ...additionalProps } as unknown as ExtendResource<
        ResourceEndpoint<BEndpoint>,
        V
      >;
    }
  }

  /**
   * Extends an array of resources by injecting query methods for each resource.
   * @param value - The array of resources to extend.
   * @param baseEndpoint - The base endpoint associated with the resources.
   * @returns An array of extended resources.
   */
  private extendResourceArray<
    V extends Array<ResourceItem>,
    BEndpoint extends Endpoint
  >(value: V, baseEndpoint: BEndpoint) {
    if (!value.length) {
      return value;
    }

    return value.map((item) => this.extendResource(item, baseEndpoint));
  }

  /**
   * Extends a collection by injecting query methods for interacting with the collection.
   * @param value - The collection to extend.
   * @param baseType - The base type of the collection.
   * @param parent - The parent resource name (if applicable).
   * @returns The extended collection with query methods.
   */
  private extendCollection<V extends List, T extends EndpointType>(
    value: V,
    baseType: T,
    parent?: string
  ) {
    try {
      const endpoint = this.extractEndpointFromURI(value.collectionURI);
      this.collections[baseType].push(endpoint);

      // If there's a parent resource, set its name for the collection
      if (parent) {
        this.resourceNames.set(endpoint, parent);
      }

      function isList(input: any): input is List {
        if (
          typeof input === "object" &&
          input !== null &&
          typeof input.available === "number" &&
          typeof input.returned === "number" &&
          typeof input.collectionURI === "string" &&
          Array.isArray(input.items)
        ) {
          return input.items.every(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              typeof item.resourceURI === "string" &&
              typeof item.name === "string"
          );
        }
        return false;
      }

      return (<TEndpoint extends Endpoint>(
        endpoint: TEndpoint
      ): ExtendCollection<TEndpoint, V> => {
        const items: ExtendResourceList<
          ResourceEndpoint<TEndpoint>,
          V
        > = value.items.map((item) => this.extendResource(item, endpoint));

        const additionalProps: ExtendCollectionProperties<TEndpoint, V> = {
          items,
          endpoint,
          query: (
            params: Parameters<TEndpoint> = {}
          ): MarvelQueryInterface<TEndpoint> =>
            new this.createQuery<TEndpoint>({ endpoint, params }),
        };

        return {
          ...value,
          ...additionalProps,
        };
      })(endpoint);
    } catch (error) {
      this.logger.error(`Failed to determine collection endpoint: ${error}`);
      return value;
    }
  }

  /**
   * Logs a summary of the auto-query injection process, including the total number
   * of resources and collections processed, along with counts per type.
   * @param resources - The map of resources processed.
   * @param collections - The map of collections processed.
   */
  private logAutoQueryInjectionSummary(
    resources: Record<string, Endpoint[]>,
    collections: Record<string, Endpoint[]>
  ): void {
    const totalCollections = Object.values(collections).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    const totalResources = Object.values(resources).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    const count = (obj: Record<string, Endpoint[]>) =>
      Object.entries(obj)
        .filter(([, items]) => items.length > 0)
        .map(([type, items]) => `${type}: ${items.length}`)
        .join(", ");

    const collectionsSummary = count(collections);
    const resourcesSummary = count(resources);

    const summary: string[] = ["AutoQuery Injection Summary"];
    summary.push(
      `=================================================================\n`
    );
    summary.push(` Total Collections Processed: ${totalCollections}`);
    summary.push(` ${collectionsSummary}`);
    summary.push(
      `\n-----------------------------------------------------------------\n`
    );
    summary.push(` Total Resources Processed: ${totalResources}`);
    summary.push(` ${resourcesSummary}`);
    summary.push(
      `\n=================================================================`
    );

    this.logger.verbose(summary.join(`\n`));
  }

  /**
   * Logs the resources and collections found during the auto-query injection process.
   */
  private logResourcesAndCollections(): void {
    const resources = this.sortEndpoints(this.resources);
    const resourceList = resources
      .map((endpoint) => {
        const name = this.resourceNames.get(endpoint) ?? "Unknown Resource";
        return `${endpoint.join("/")} - ${name}`;
      })
      .join("\n");

    this.logger.verbose(`Resources:\n\n${resourceList}`);

    const collections = this.sortEndpoints(this.collections);
    const collectionsList = collections
      .map((endpoint) => {
        const name = this.resourceNames.get(endpoint) ?? "Unknown Collection";
        return `${endpoint.join("/")} - ${name}`;
      })
      .join("\n");

    this.logger.verbose(`Collections:\n\n${collectionsList}`);
  }

  private assertResourceEndpoint<B extends Endpoint>(
    base: DataType<B>,
    endpoint: unknown[]
  ): asserts endpoint is ResourceEndpoint<B> {
    EndpointBuilder.assertsEndpoint(endpoint);
    const endpointType = this.typeFromEndpoint(endpoint);
    if (base !== endpointType && endpoint.length !== 2) {
      throw new Error(`Invalid resource endpoint: ${endpoint}`);
    }
  }

  /**
   * Creates an endpoint array from a URI.
   * @param url - The URI string to convert into an endpoint array.
   * @returns The constructed endpoint array.
   * @throws Will throw an error if the URI is invalid.
   */
  private extractEndpointFromURI(url: string): Endpoint {
    const cleanedUrl = url.replace(/^.*\/public\//, "");
    const endpoint = cleanedUrl.split("/");

    EndpointBuilder.assertsEndpoint(endpoint);

    return endpoint;
  }

  /**
   * Checks if an object has a `resourceURI` property.
   * @param obj - The object to check.
   * @returns True if the object has a `resourceURI`, false otherwise.
   */
  private hasResourceURI(obj: any): obj is Summary {
    return obj && obj.resourceURI && typeof obj.resourceURI === "string";
  }

  /**
   * Checks if an object has a `collectionURI` property.
   * @param obj - The object to check.
   * @returns True if the object has a `collectionURI`, false otherwise.
   */
  private hasCollectionURI(obj: any): obj is List {
    return obj && obj.collectionURI && typeof obj.collectionURI === "string";
  }

  /**
   * Extracts the resource type from an endpoint.
   * @param endpoint - The endpoint to extract the type from.
   * @returns The extracted endpoint type.
   * @throws Will throw an error if the type is invalid.
   */
  private typeFromEndpoint<T extends Endpoint>(endpoint: T): DataType<T> {
    const type = endpoint[2] ? endpoint[2] : endpoint[0];
    EndpointBuilder.assertsType(type);

    return type as DataType<T>;
  }

  /**
   * Sorts and deduplicates an array of endpoints by their elements for logging.
   * @param list - The list of endpoints to sort and deduplicate.
   * @returns The sorted and deduplicated array of endpoints.
   */
  private sortEndpoints(list: Record<EndpointType, Endpoint[]>): Endpoint[] {
    // Combine all arrays from the list
    const combinedArray = Object.values(list).flat();

    // Use a Map to deduplicate based on all elements of the Endpoint array
    const map = new Map<string, Endpoint>();

    combinedArray.forEach((endpoint) => {
      const key = `${endpoint[0]}-${endpoint[1] ?? ""}-${endpoint[2] ?? ""}`; // Create a unique key for each Endpoint
      if (!map.has(key)) {
        map.set(key, endpoint);
      }
    });

    // Return the deduplicated array
    const dedupedArray = Array.from(map.values());

    return dedupedArray.sort((a, b) => {
      // Compare first element alphabetically
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;

      // Compare second element numerically if both arrays have a second element
      if (a[1] !== undefined && b[1] !== undefined) {
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
      }

      // If one has a second element and the other doesn't, prioritize the one with the second element
      if (a[1] !== undefined && b[1] === undefined) return 1;
      if (a[1] === undefined && b[1] !== undefined) return -1;

      // Compare third element alphabetically if both arrays have a third element
      if (a[2] && b[2]) {
        if (a[2] < b[2]) return -1;
        if (a[2] > b[2]) return 1;
      }

      // If one has a third element and the other doesn't, prioritize the one with the third element
      if (a[2] && !b[2]) return 1;
      if (!a[2] && b[2]) return -1;

      // All elements are equal
      return 0;
    });
  }

  /**
   * Finds the resource name from a resource object.
   * @param resource - The resource object.
   * @returns The name of the resource.
   */
  private findResourceName(resource: any): string {
    return resource.name || resource.title || resource.fullName || "";
  }
}
