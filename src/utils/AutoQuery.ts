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
  collectionNames: Map<Endpoint, string> = new Map();
  logger: CustomLogger;

  constructor(
    MarvelQueryClass: new <NewEndpoint extends Endpoint>({
      endpoint,
      params,
    }: InitQuery<NewEndpoint>) => MarvelQueryInterface<NewEndpoint>,
    endpoint: EndpointDescriptor<E>,
    logger: CustomLogger,
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
    this.logSortedCollectionsAndResources();

    return extendedResults;
  }

  private logSortedCollectionsAndResources(): void {
    // Helper function to log content for a given collection or resource type
    const logContentForType = (
      type: string,
      endpoints: Endpoint[],
      nameGetter: (endpoint: Endpoint) => string | undefined,
      label: string
    ): void => {
      if (!Array.isArray(endpoints) || endpoints.length === 0) {
        return;
      }

      const sortedEndpoints = this.sortEndpointsById(endpoints);
      const formattedEndpoints = sortedEndpoints
        .map((endpoint) => {
          const name = nameGetter(endpoint) || "Unknown Name";
          return `${endpoint.join("/")} - ${name}`;
        })
        .join("\n");

        this.logger.verbose(`${label} - ${type}:\n${formattedEndpoints}`);
    };

    // Log each collection type separately
    Object.entries(this.collections).forEach(([type, endpoints]) => {
      logContentForType(
        type,
        endpoints,
        (endpoint) => this.collectionNames.get(endpoint),
        "Collection"
      );
    });

    // Log each resource type separately
    Object.entries(this.resources).forEach(([type, endpoints]) => {
      logContentForType(
        type,
        endpoints,
        (endpoint) => this.resourceNames.get(endpoint),
        "Resource"
      );
    });
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

    const collectionsSummary = Object.entries(collections)
      .map(([type, items]) => `${type}: ${items.length}`)
      .join(", ");

    const resourcesSummary = Object.entries(resources)
      .map(([type, items]) => `${type}: ${items.length}`)
      .join(", ");

      this.logger.verbose("AutoQuery Injection Summary");
      this.logger.verbose("==================================================");
      this.logger.verbose(`Total Collections Processed: ${totalCollections}`);
      this.logger.verbose(collectionsSummary);
      this.logger.verbose("--------------------------------------------------");
      this.logger.verbose(`Total Resources Processed: ${totalResources}`);
      this.logger.verbose(resourcesSummary);
      this.logger.verbose("==================================================");
  }

  private sortEndpointsById(endpoints: Array<Endpoint>): Array<Endpoint> {
    const uniqueEndpoints = new Map<string, Endpoint>();
  
    endpoints.forEach(endpoint => {
      const id = endpoint[1] ?? 0; // Default to 0 if the second element is undefined
      const key = `${endpoint[0]}/${id}`; // Create a unique key based on the endpoint type and ID
      if (!uniqueEndpoints.has(key)) {
        uniqueEndpoints.set(key, endpoint);
      }
    });
  
    return Array.from(uniqueEndpoints.values()).sort((a, b) => {
      const idA = a[1] ?? 0;
      const idB = b[1] ?? 0;
      return idA - idB;
    });
  }
  private findResourceName(resource: any): string {
    return resource.name || resource.title || resource.fullName || "";
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
        this.collectionNames.set(endpoint, parent);
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
    return obj && (obj as any).resourceURI && typeof (obj as any).resourceURI === "string";
  }

  private hasCollectionURI<T>(obj: T): obj is T & { collectionURI: string } {
    return obj && (obj as any).collectionURI && typeof (obj as any).collectionURI === "string";
  }

  private typeFromEndpoint(endpoint: Endpoint): EndpointType {
    const type = endpoint[2] ? endpoint[2] : endpoint[0];
  
    if (!VALID_ENDPOINTS.has(type)) {
      throw new Error(`Unable to determine type from endpoint: ${endpoint.join("/")}`);
    }
  
    return type;
  }
  
}
