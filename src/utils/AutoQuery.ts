import logger from "./Logger";
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
import { ENDPOINT_MAP } from "../models/endpoints";
import {
  hasResourceURI,
  hasCollectionURI,
  extractIdFromURI,
  typeFromEndpoint,
  createEndpointFromURI,
} from "./functions";

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

  constructor(
    MarvelQueryClass: new <NewEndpoint extends Endpoint>({
      endpoint,
      params,
    }: InitQuery<NewEndpoint>) => MarvelQueryInterface<NewEndpoint>,
    endpoint: EndpointDescriptor<E>
  ) {
    this.createQuery = MarvelQueryClass;
    this.endpoint = endpoint;
    logger.verbose(
      `ExtendQuery instance created for endpoint: ${endpoint.path.join("/")}`
    );
  }

  inject(results: Result<E>[]): ExtendResult<E>[] {
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
            logger.error(`Invalid or missing endpoints for type ${type}:`, endpoints);
            return;
        }

        const sortedEndpoints = this.sortEndpointsById(endpoints);
        const formattedEndpoints = sortedEndpoints
            .map((endpoint) => {
                const name = nameGetter(endpoint) || "Unknown Name";
                return `${endpoint.join("/")} - ${name}`;
            })
            .join("\n");

        logger.info(`${label} - ${type}:\n${formattedEndpoints}`);
    };

    // Log each collection type separately
    Object.entries(this.collections).forEach(([type, endpoints]) => {
        logContentForType(type, endpoints, (endpoint) => this.collectionNames.get(endpoint), 'Collection');
    });

    // Log each resource type separately
    Object.entries(this.resources).forEach(([type, endpoints]) => {
        logContentForType(type, endpoints, (endpoint) => this.resourceNames.get(endpoint), 'Resource');
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

    logger.info("AutoQuery Injection Summary");
    logger.info("===========================");
    logger.info(`Total Collections Processed: ${totalCollections}`);
    logger.info(`Collections Breakdown: ${collectionsSummary}`);
    logger.info("---------------------------");
    logger.info(`Total Resources Processed: ${totalResources}`);
    logger.info(`Resources Breakdown: ${resourcesSummary}`);
    logger.info("===========================");
  }

  private combinedArrayLengths(obj: Record<string, any[]>): number {
    return Object.values(obj).reduce((totalLength, array) => {
      if (Array.isArray(array)) {
        return totalLength + array.length;
      }
      return totalLength;
    }, 0);
  }

  private sortEndpointsById(endpoints: Array<Endpoint>): Array<Endpoint> {
    return endpoints.sort((a, b) => {
      const idA = a[1] ?? 0; // Default to 0 if the second element is undefined
      const idB = b[1] ?? 0; // Default to 0 if the second element is undefined
      return idA - idB;
    });
  }
  private findResourceName(resource: any): string {
    return resource.name || resource.title || resource.fullName || "";
  }

  private logVerboseDetails(message: {
    type: "result" | "collection" | "resource";
    name: string;
    endpoint: Endpoint;
  }) {
    const endpoint = message.endpoint.join("/");
    logger.verbose(`Found ${message.type} [${endpoint}] ${message.name}`);
  }

  extendResult(result: Result<E>): ExtendResult<E> {
    const endpoint = this.endpoint.path;
    // this.logVerboseDetails({
    //   type: "result",
    //   name: this.findResourceName(result),
    //   endpoint,
    // });

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

      if (hasResourceURI(value)) {
        // ExtendedResource<E, K>
        acc[key] = this.extendResource(value, [keyEndpointType]);
      } else if (hasCollectionURI(value)) {
        // ExtendedCollection<E, K, Result<E>[K]>
        acc[key] = this.extendCollection(value, keyEndpointType, this.findResourceName(result));
      } else if (Array.isArray(value) && hasResourceURI(value[0])) {
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
    const id: number = extractIdFromURI(value.resourceURI);
    const baseType = typeFromEndpoint(baseEndpoint);
    const endpoint: ResourceEndpoint<BEndpoint> = [
      baseType,
      id,
    ] as ResourceEndpoint<BEndpoint>;

    this.resources[baseType].push(endpoint);
    this.resourceNames.set(endpoint, this.findResourceName(value));

    this.logVerboseDetails({
      type: "resource",
      name: this.findResourceName(value),
      endpoint,
    });

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
          params: Parameters<Extendpoint<TEndpoint, TType>> = {} as Parameters<
            Extendpoint<TEndpoint, TType>
          >
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
    const endpoint = createEndpointFromURI(value.collectionURI);
    this.collections[baseType].push(endpoint);

    // Set name of collection as the name of the parent resource
    if (parent) {
      this.collectionNames.set(endpoint, parent);
    }

    this.logVerboseDetails({
      type: "collection",
      name: this.findResourceName(value),
      endpoint,
    });

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
  }
}
