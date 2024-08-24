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

export class ExtendQuery<E extends Endpoint> {
  createQuery: new <NewEndpoint extends Endpoint>({
    endpoint,
    params,
  }: InitQuery<NewEndpoint>) => MarvelQueryInterface<NewEndpoint>;
  endpoint: EndpointDescriptor<E>;

  constructor(
    MarvelQueryClass: new <NewEndpoint extends Endpoint>({
      endpoint,
      params,
    }: InitQuery<NewEndpoint>) => MarvelQueryInterface<NewEndpoint>,
    endpoint: EndpointDescriptor<E>
  ) {
    this.createQuery = MarvelQueryClass;
    this.endpoint = endpoint;
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

      if (hasResourceURI(value)) {
        // ExtendedResource<E, K>
        acc[key] = this.extendResource(value, [keyEndpointType]);
      } else if (hasCollectionURI(value)) {
        // ExtendedCollection<E, K, Result<E>[K]>
        acc[key] = this.extendCollection(value, keyEndpointType);
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

    return (<TEndpoint extends Endpoint>(
      endpoint: TEndpoint
    ): ExtendResource<TEndpoint, V> => {
      const additionalProps: ExtendResourceProperties<TEndpoint> = {
        endpoint,
        fetch: () => {
          // Does this actually work?
          const query = new this.createQuery({
            endpoint,
            params: {} as Parameters<TEndpoint>,
          });

          return query.fetch();
        },
        fetchSingle: () => {
          // Does this actually work?
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
    if (!value) return value;
    return value.map((item) => this.extendResource(item, baseEndpoint));
  }

  private extendCollection<V extends List, T extends EndpointType>(
    value: V,
    baseType: T
  ) {
    const endpoint = createEndpointFromURI(value.collectionURI);

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