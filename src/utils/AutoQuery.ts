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
} from "../models/types";
import { InitQuery, MarvelQueryInterface } from "../models/types";
import { ENDPOINT_MAP, VALID_ENDPOINTS } from "../models/endpoints";
// import {
//   hasResourceURI,
//   hasCollectionURI,
//   extractIdFromURI,
//   typeFromEndpoint,
//   createEndpointFromURI,
// } from "./functions";

/** Utility class for auto-query injection, finds URIs in data and injects query methods. */
export class AutoQuery<E extends Endpoint> {
  createQuery: new <NewEndpoint extends Endpoint>({
    endpoint,
    params,
  }: InitQuery<NewEndpoint>) => MarvelQueryInterface<NewEndpoint>;

  endpoint: EndpointDescriptor<E>;
  resources: EndpointMap<Endpoint[]> = {
    comics: [],
    series: [],
    characters: [],
    events: [],
    stories: [],
    creators: [],
  };
  collections: EndpointMap<Endpoint[]> = {
    comics: [],
    series: [],
    characters: [],
    events: [],
    stories: [],
    creators: [],
  };
  resourceNames: Map<Endpoint, string> = new Map();

  logger: CustomLogger;

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

  inject(results: Result<E>[]): ExtendResult<E>[] {
    this.logger.verbose(`Starting auto-query injection...`);

    const extendedResults = results.map((result) => this.extendResult(result));

    // Log sumary of auto-query injection
    this.logAutoQueryInjectionSummary(this.resources, this.collections);
    this.logResourcesAndCollections();

    return extendedResults;
  }

  extendResult(result: Result<E>): ExtendResult<E> {
    const endpoint = this.endpoint.path;
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

      if (this.hasResourceURI(value)) {
        // ExtendedResource<E, K>
        acc[key] = this.extendResource(value, [keyEndpointType]);
      } else if (this.hasCollectionURI(value)) {
        // ExtendedCollection<E, K, Result<E>[K]>
        acc[key] = this.extendCollection(
          value,
          keyEndpointType,
          this.findResourceName(result)
        );
      } else if (Array.isArray(value) && this.hasResourceURI(value[0])) {
        // ExtendedResourceArray<E, K>
        acc[key] = this.extendResourceArray(value, [keyEndpointType]);
      }

      return acc;
    }, {} as ExtendType<E>);

    const resultExtendingProperties: ExtendResourceProperties<E> = {
      endpoint,
      fetch: () => {
        const query = new this.createQuery<E>({
          endpoint,
          params: {} as Parameters<E>,
        });
        return query.fetch();
      },
      fetchSingle: () => {
        const query = new this.createQuery<E>({
          endpoint,
          params: {} as Parameters<E>,
        });
        return query.fetchSingle();
      },
      query: <TType extends NoSameEndpointType<E>>(
        type: TType,
        params: Parameters<Extendpoint<E, TType>>
      ): MarvelQueryInterface<Extendpoint<E, TType>> => {
        return new this.createQuery<Extendpoint<E, TType>>({
          endpoint: [endpoint[0], endpoint[1], type] as Extendpoint<E, TType>,
          params,
        });
      },
    };

    return {
      ...propertiesExtended,
      ...resultExtendingProperties,
    };
  }

  private extendResource<V extends ResourceItem, BEndpoint extends Endpoint>(
    value: V,
    baseEndpoint: BEndpoint
  ) {
    try {
      const id: number = this.extractIdFromURI(value.resourceURI);
      const baseType = this.typeFromEndpoint(baseEndpoint);
      const endpoint: ResourceEndpoint<BEndpoint> = [
        baseType,
        id,
      ] as ResourceEndpoint<BEndpoint>;

      this.resources[baseType].push(endpoint);
      this.resourceNames.set(endpoint, this.findResourceName(value));

      return (<TEndpoint extends Endpoint>(
        endpoint: TEndpoint
      ): ExtendResource<TEndpoint, V> => {
        const additionalProps: ExtendResourceProperties<TEndpoint> = {
          endpoint,
          fetch: () => {
            const query = new this.createQuery({
              endpoint,
              params: {} as Parameters<TEndpoint>,
            });

            return query.fetch();
          },
          fetchSingle: () => {
            const query = new this.createQuery({
              endpoint,
              params: {} as Parameters<TEndpoint>,
            });

            return query.fetchSingle();
          },
          query: <TType extends EndpointType>(
            type: TType,
            params: Parameters<
              Extendpoint<TEndpoint, TType>
            > = {} as Parameters<Extendpoint<TEndpoint, TType>>
          ): MarvelQueryInterface<Extendpoint<TEndpoint, TType>> => {
            return new this.createQuery<Extendpoint<TEndpoint, TType>>({
              endpoint: [endpoint[0], endpoint[1], type] as Extendpoint<
                TEndpoint,
                TType
              >,
              params,
            });
          },
        };

        return {
          ...value,
          ...additionalProps,
        };
      })(endpoint);
    } catch (error) {
      this.logger.error(`Failed to determine resource endpoint: ${error}`);

      return value;
    }
  }

  private extendResourceArray<
    V extends Array<ResourceItem>,
    BEndpoint extends Endpoint
  >(value: V, baseEndpoint: BEndpoint) {
    if (!value.length) {
      return value;
    }

    return value.map((item) => this.extendResource(item, baseEndpoint));
  }

  private extendCollection<V extends List, T extends EndpointType>(
    value: V,
    baseType: T,
    parent?: string
  ) {
    try {
      const endpoint = this.createEndpointFromURI(value.collectionURI);
      this.collections[baseType].push(endpoint);

      // Set name of collection as the name of the parent resource
      if (parent) {
        this.resourceNames.set(endpoint, parent);
      }

      return (<TEndpoint extends Endpoint>(
        endpoint: TEndpoint
      ): ExtendCollection<TEndpoint, V> => {
        const items = value.items.map(
          (item) =>
            this.extendResource(item, endpoint) as ExtendResourceList<
              ResourceEndpoint<TEndpoint>,
              V
            >[number]
        );

        const additionalProps: ExtendCollectionProperties<TEndpoint, V> = {
          items,
          endpoint,
          query: (
            params: Parameters<TEndpoint> = {} as Parameters<TEndpoint>
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

  private createEndpointFromURI(url: string): Endpoint {
    // Remove everything from 'http' to '/public/'
    const cleanedUrl = url.replace(/^.*\/public\//, "");

    // Split the remaining part of the URL by '/'
    const parts = cleanedUrl.split("/");

    if (parts.length < 1) {
      this.logger.error(`Invalid URL: ${url}`);
      throw new Error(`Invalid URL: ${url}`);
    }

    const baseType = parts[0] as EndpointType;
    if (!VALID_ENDPOINTS.has(baseType)) {
      throw new Error(`Invalid endpoint: ${baseType}`);
    }

    const id = parts[1];
    if (!id) {
      throw new Error(`Missing ID in URL: ${url}`);
    }

    const type = parts[2];

    const endpoint = [
      baseType,
      Number(id),
      type ? type : undefined,
    ] as Endpoint;

    return endpoint;
  }

  private extractIdFromURI(url: string): number {
    const cleanedUrl = url.replace(/^.*\/public\//, "");

    const parts = cleanedUrl.split("/");

    if (parts.length < 2) {
      this.logger.error(`Invalid URL: ${url}`);
      throw new Error(`Invalid URL: ${url}`);
    }

    const id = parts[1];

    if (id && !/^\d+$/.test(id)) {
      this.logger.error(`Invalid ID: ${id}`);
      throw new Error(`Invalid ID: ${id}`);
    }

    return Number(id);
  }

  private hasResourceURI<T>(obj: T): obj is T & { resourceURI: string } {
    return (
      obj &&
      (obj as any).resourceURI &&
      typeof (obj as any).resourceURI === "string"
    );
  }

  private hasCollectionURI<T>(obj: T): obj is T & { collectionURI: string } {
    return (
      obj &&
      (obj as any).collectionURI &&
      typeof (obj as any).collectionURI === "string"
    );
  }

  private typeFromEndpoint(endpoint: Endpoint): EndpointType {
    const type = endpoint[2] ? endpoint[2] : endpoint[0];

    if (!VALID_ENDPOINTS.has(type)) {
      throw new Error(
        `Unable to determine type from endpoint: ${endpoint.join("/")}`
      );
    }

    return type;
  }

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
    const dedeupedArray = Array.from(map.values());

    return dedeupedArray.sort((a, b) => {
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
        .filter(([, items]) => items.length > 0) // Filter out items with length 0
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

  private findResourceName(resource: any): string {
    return resource.name || resource.title || resource.fullName || "";
  }
}
