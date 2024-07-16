import * as CryptoJS from 'crypto-js';
import axios from 'axios';

import {
  Endpoint,
  Parameters,
  ParamsType,
  ResultType,
  DataTypeKey,
  OnResultMap,
  OnResultFunction,
  ResultMap,
  InitArgs,
  APIWrapper,
  MarvelQueryResults,
  APIResponseData,
  ExtendEndpointParams,
  Metadata,
  GlobalParams,
} from './definitions/data-types';
import { ValidateParams, ResultSchemaMap } from './definitions/data-schemas';

class MarvelQuery<Type extends Endpoint> {
  // Initialize the public and private keys
  static publicKey: string;
  static privateKey: string;
  // Options
  static globalParams?: GlobalParams;
  static omitThe?: boolean = false;
  static omitUndefined?: boolean = true;
  // Functions
  static onRequest?: (url: string) => void;
  static onResult?: OnResultMap;
  static fetchFunction?: (url: string) => Promise<unknown>;

  static init(args: InitArgs) {
    Object.assign(MarvelQuery, { ...args });
    return createQuery;
  }

  endpoint: Type;
  params: Parameters<Type>;
  onResult?: OnResultFunction<ResultMap[DataTypeKey]>;

  type: DataTypeKey;

  constructor(endpoint: Type, params: ParamsType<Type>) {
    // Determine whether the endpoint is an array or ResultType<Type>
    if (typeof endpoint[0] === 'string') {
      this.endpoint = endpoint as Type;
    } else {
      // build the end point from the URI
    }

    params = (MarvelQuery.omitUndefined ? this.omitUndefined(params) : params)

    // TODO: add type validation
    this.type = (
      endpoint.length === 3 ? endpoint[2] : endpoint[0]
    ) as DataTypeKey;

    this.params = {
      // Default parameters
      offset: 0,
      limit: 100,
      // Global parameters
      ...MarvelQuery.globalParams?.all,
      ...MarvelQuery.globalParams?.[this.type],
      // Specific parameters
      ...params,
    };

    if (MarvelQuery.onResult) {
      this.onResult = MarvelQuery.onResult[this.type];
    }

    if (MarvelQuery.omitThe && 'title' in this.params) {
      this.params.title = this.omitThe(this.params.title as string)
    }
  }

  // async fetchSingle() {
  //   this.params.limit = 1;
  //   this.fetch();
  //   return this.result;
  // }

  private omitUndefined(params: ParamsType<Type>) {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );
  }

  private createQuery<Type extends Endpoint>(
    endpoint: Type,
    params: ParamsType<Type>
  ): MarvelQuery<Type> {
    if (!MarvelQuery.publicKey || !MarvelQuery.privateKey) {
      throw new Error('Missing public or private keys');
    }
    return new MarvelQuery<Type>(endpoint, params);
  }

  async fetch(): Promise<MarvelQueryResult<Type>> {
    this.validateParams();
    const url = this.buildURL();

    try {
      const { data, ...metadata } = await this.request(url);
      const { results, ...responseData } = data;

      const queryResults: MarvelQueryResults<Type> = {
        url,
        metadata,
        responseData,
        results,
      };

      if (this.onResult) {
        this.onResult(results);
      }

      return new MarvelQueryResult<Type>(this, queryResults);
    } catch (error) {
      console.error('Request error:', error);
      throw new Error('Request error');
    }
  }

  buildURL() {
    const baseURL = 'https://gateway.marvel.com/v1/public';
    const endpoint = this.endpoint.join('/');
    const timestamp = Number(new Date());
    const { privateKey, publicKey } = MarvelQuery;
    const hash = privateKey
      ? CryptoJS.MD5(timestamp + privateKey + publicKey).toString()
      : '';

    const queryParams = new URLSearchParams({
      apikey: publicKey,
      ts: timestamp.toString(),
      hash,
      ...(this.params as Record<string, string>),
    });

    return `${baseURL}/${endpoint}?${queryParams.toString()}`;
  }

  async request(url: string): Promise<APIWrapper<ResultType<Type>>> {
    try {
      if (MarvelQuery.onRequest) {
        MarvelQuery.onRequest(url);
      }

      let response;

      if (MarvelQuery.fetchFunction) {
        response = await MarvelQuery.fetchFunction(url);
      } else {
        response = await axios.get(url);
      }

      const resultSchema = ResultSchemaMap[this.type];
      if (!resultSchema) {
        throw new Error(`Invalid result schema, ${this.type}`);
      }

      resultSchema.parse(response.data.data.results);

      return response.data as APIWrapper<ResultType<Type>>;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      throw new Error('Failed to fetch data from Marvel API');
    }
  }

  private validateParams(): void {
    try {
      ValidateParams[this.type].parse(this.params);
    } catch (error) {
      console.error('Parameter validation error:', error);
      throw new Error('Invalid parameters');
    }
  }

  private omitThe(title: string): string {
    // Remove the 'the' from the beginning of the title
    const prefix = 'the ';
    if (title.toLowerCase().startsWith(prefix)) {
      return title.slice(prefix.length);
    }
    return title;
  }
}

export function createQuery<Type extends Endpoint>(
  endpoint: Type,
  params: ParamsType<Type>
): MarvelQuery<Type> {
  if (!MarvelQuery.publicKey || !MarvelQuery.privateKey) {
    throw new Error('Missing public or private keys');
  }
  return new MarvelQuery<Type>(endpoint, params);
}

class MarvelQueryResult<Type extends Endpoint> extends MarvelQuery<Type> {
  url: string;
  metadata: Metadata;
  responseData: APIResponseData;
  result: ResultType<Type>;
  results: ResultType<Type>[];
  resultHistory: ResultType<Type>[];

  constructor(query: MarvelQuery<Type>, results: MarvelQueryResults<Type>) {
    const offset = results.responseData.offset + query.params.limit;
    const params = {
      ...query.params,
      offset,
    };

    super(query.endpoint, params);

    this.url = results.url;
    this.metadata = results.metadata;
    this.responseData = results.responseData;
    this.result = results.results[0];
    this.results = results.results;
    this.resultHistory = results.results;
  }

  async fetch(): Promise<MarvelQueryResult<Type>> {
    const total = this.responseData.total;
    const remaining = total - this.params.offset; // Double check this

    if (remaining <= 0) {
      console.error('No more results to fetch');
      return this;
    }

    const { data, ...metadata } = await this.request(this.url);
    const { results, ...responseData } = data;

    this.metadata = metadata;
    this.responseData = responseData;
    this.results = results;
    this.result = results[0];
    this.resultHistory = [...this.resultHistory, ...results];

    if (results.length === 1) {
      this.result = results[0];
    }

    return this;
  }

  // Work in progress, functions for getting the content related to the result
  private search<SearchType extends DataTypeKey>(
    type: DataTypeKey,
    params: ExtendEndpointParams<SearchType> = {}
  ) {
    return this.searchFor(type, params, this.result);
  }

  searchFor<SearchType extends DataTypeKey>(
    type: DataTypeKey,
    params: ExtendEndpointParams<SearchType>,
    item: ResultType<Type>
  ) {
    const id = item.id;
    return createQuery([this.endpoint[0], id, type], params);
  }
}

export default MarvelQuery;
export * from './definitions/data-types';
export * from './definitions/param-types';

import * as sample from './samples';
export { sample };